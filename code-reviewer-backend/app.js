const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const dotenv = require('dotenv');
const User = require('./models/User');
const axios = require('axios');
const { exec } = require('child_process');
const Repository = require('./models/Repo');
dotenv.config();

const app = express();
app.use(express.json())
// Middleware for sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));


app.use(passport.initialize()); //initialize passport
app.use(passport.session()); //initialize passport session

passport.use(new GitHubStrategy({                   // passing configurarions of github into passport for fetching profile
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
}, async function (accessToken, refreshToken, profile, done) {
    // In a real-world application, you would save the user info to a database here

    try {
        const existingUser = await User.findOne({ githubId: profile.id });
        if (!existingUser) {
            const user = await User.create({
                githubId: profile.id,
                username: profile.username,
                displayName: profile.displayName,
                profileUrl: profile.profileUrl,
                avatarUrl: profile.photos[0].value,
                bio: profile._json.bio,
            });
            console.log(user);
        }

    }
    catch (err) {
        console.log(err)
    }
    profile.accessToken = accessToken;
    return done(null, profile);

}));

passport.serializeUser((user, done) => {               // saving a chunck of data  in session
    done(null, user);
});

passport.deserializeUser((obj, done) => {      // fetching saved chunck of data while making api calls
    done(null, obj);
});

// Routes
app.get('/', (req, res) => {
    res.send(`<h1>Home</h1><a href="/auth/github">Login with GitHub</a>`);
});

// GitHub OAuth routes
app.get('/auth/github', (req, res, next) => {
    passport.authenticate('github', {
        scope: ['user:email', 'repo'],  // Request access to repositories 
    })(req, res, next);
});

app.get('/auth/github/callback',
    passport.authenticate('github', {
        failureRedirect: '/'
    }),
    (req, res) => {
        // Successful authentication
        res.redirect('/repos');
    });

app.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.send(`<h1>Hello ${req.user.username}</h1><a href="/logout">Logout</a>`);
});

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


// Route to get GitHub repositories
app.get('/repos', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Retrieve the access token from the session
    const accessToken = req.user.accessToken;

    try {
        // Make a request to the GitHub API to get the user's repositories
        const response = await axios.get('https://api.github.com/user/repos', {
            headers: {
                Authorization: `token ${accessToken}`
            }
        });

        const repos = response.data;
        console.log(response.data);

        res.json(repos);
    } catch (err) {
        console.error('Error fetching repositories:', err);
        res.status(500).json({ message: 'Error fetching repositories' });
    }
});


// Clone Repository
app.post('/clone', async (req, res) => {
    const { repoUrl } = req.body;


    exec(`git clone ${repoUrl}`, async (err, stdout, stderr) => {
        if (err) {
            console.error('Error cloning repo:', stderr);
            return res.status(500).json({ error: 'Error cloning repository' });
        }
        // Save repository info to MongoDB
        const repoName = repoUrl.split('/').pop().replace('.git', '');       
        const repository = new Repository({ name: repoName, url: repoUrl });
        repository.save().then(() => {
            res.status(200).json({ message: 'Repository cloned successfully', repository });
        }).catch((err) => {
            console.error('Error saving repository:', err);
            res.status(500).json({ error: 'Error saving repository' });
        });
    });
});


module.exports = app;
