const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

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
}, function (accessToken, refreshToken, profile, done) {
    // In a real-world application, you would save the user info to a database here
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
        res.redirect('/profile');
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