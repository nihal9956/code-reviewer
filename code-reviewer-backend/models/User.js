const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
    unique: true,
  },
  username: String,
  displayName: String,
  profileUrl: String,
  avatarUrl: String,
});

const User = mongoose.model('User', userSchema);