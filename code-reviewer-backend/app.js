const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const dotenv = require('dotenv');
const User = require('./models/User')
const { gitHubAuth, githubAuthCallBack, githubLogOut } = require('./Controller/Auth');
const { review } = require('./Controller/Review');
const { getProfile } = require('./Controller/Profile');
const { passportMiddleware } = require('./Middlewares/AuthMiddleware');

dotenv.config();

const app = express();
//middlewares
app.use(express.json())
// Middleware for sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));



app.use(passport.initialize()); 
app.use(passport.session());
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
app.get('/auth/github', gitHubAuth );

app.get('/auth/github/callback',
    passportMiddleware,
    githubAuthCallBack);



app.post('/review',review);

app.get('/profile',getProfile);

app.get('/logout', githubLogOut);

module.exports = app;