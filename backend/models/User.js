const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  picture: String,
  settings: {
    startTime: {
      type: String,
      default: '09:00'
    },
    endTime: {
      type: String,
      default: '17:00'
    }
  },
  license: {
    isActive: {
      type: Boolean,
      default: false
    },
    stripeCustomerId: String,
    subscriptionId: String,
    expiresAt: Date
  },
  accessToken: String,
  refreshToken: String,
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);