const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('./models/User'); // Import the User model

passport.use(new GitHubStrategy({
  clientID: 'YOUR_GITHUB_CLIENT_ID',
  clientSecret: 'YOUR_GITHUB_CLIENT_SECRET',
  callbackURL: 'http://localhost:3000/auth/github'
},
async (accessToken, refreshToken, profile, done) => {
  // Find or create a user in MongoDB
  try {
    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = new User({
        githubId: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        profileUrl: profile.profileUrl,
        avatarUrl: profile.photos[0].value,
      });
      await user.save();
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}
));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
