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
  displayName: String,
  photoURL: String,
  license: {
    isActive: {
      type: Boolean,
      default: false,
    },
    stripeCustomerId: String,
    subscriptionId: String,
    expiresAt: Date,
  },
  settings: {
    startTime: {
      type: String,
      default: '09:00', // 24-hour format
    },
    endTime: {
      type: String,
      default: '17:00', // 24-hour format
    },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);