const passport = require('passport');

const gitHubAuth = (req, res, next) => {
    passport.authenticate('github', {
        scope: ['user:email', 'repo'],  // Request access to repositories 
    })(req, res, next);
}
const githubAuthCallBack = (_, res) => {
    // Successful authentication
    res.redirect('/profile');
}

const githubLogOut = (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
}
module.exports = {
    gitHubAuth,
    githubAuthCallBack,
    githubLogOut
}