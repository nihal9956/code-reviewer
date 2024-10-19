const passport = require('passport');

const passportMiddleware = passport.authenticate('github', {
    failureRedirect: '/'
})
 
module.exports = {
    passportMiddleware
}