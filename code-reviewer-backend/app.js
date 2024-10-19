const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const dotenv = require('dotenv');
const User = require('./model/userModal')
const path = require('path')
const simpleGit = require('simple-git');
const fs = require('fs');
const { ESLint } = require('eslint');

dotenv.config();

const app = express();
const git = simpleGit();
app.use(express.json())
// Middleware for sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));



app.use(passport.initialize()); //initialize passport
app.use(passport.session()); //initialize passport session
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
            user = await User.create({
                githubId: profile.id,
                displayName: profile.displayName
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {           // saving a chunck of data  in session
    done(null, user);
});

passport.deserializeUser((obj, done) => {         // fetching saved chunck of data while making api calls
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
        res.redirect('/profile');
    });

const getAllJsFiles = (dir) => {
    let results = [];

    // Read the contents of the directory
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        // Check if the current file is a directory
        if (fs.statSync(filePath).isDirectory()) {
            // Recursively call this function for the directory
            results = results.concat(getAllJsFiles(filePath));
        } else if (file.endsWith('.js')) {
            // If it's a .js file, add it to the results
            results.push(filePath);
        }
    });

    return results;
};

app.post('/review', async (req, res) => {
    const { repoUrl } = req.body;

    if (!repoUrl) {
        return res.status(400).json({ error: 'Repository URL is required' });
    }

    const repoName = path.basename(repoUrl).replace('.git', '');  //extracting the repo name.
    const clonePath = path.join(__dirname, 'repos', repoName);  //getting the path of clonned repo from local
    const CODE_FOLDER = clonePath;

    try {
        // Clone the repository
        await git.clone(repoUrl, clonePath);

        try {
            const eslint = new ESLint({ fix: false, overrideConfigFile: path.join(__dirname, 'eslint.config.js'), }); // Set to true if you want to auto-fix problems
            const jsFiles = getAllJsFiles(CODE_FOLDER); // Get all .js files recursively
            const reviewResults = {};
            // Analyze each file with ESLint
            for (const file of jsFiles) {
                const results = await eslint.lintFiles([file]);

                reviewResults[file] = results.map(result => ({
                    filePath: result.filePath,
                    messages: result.messages,
                    errorCount: result.errorCount,
                    warningCount: result.warningCount,
                }));
            }
            // Send the review results as JSON response
            res.json(reviewResults);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while reviewing the code.' });
        }
    } catch (error) {
        console.error(`Failed to clone repository: ${error}`);
        res.status(500).json({ error: 'Failed to clone repository' });
    }
});

app.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.send(`<h1>Hello ${req.user.username}</h1><a href="/logout">Logout</a>`);
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

module.exports = app;