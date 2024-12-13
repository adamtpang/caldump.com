const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Admin endpoint to manually set license status
router.post('/admin/set-license', async (req, res) => {
  try {
    const { email, adminKey } = req.body;

    // Simple admin key check - you should change this to your own secret key
    if (adminKey !== 'caldump-admin-2024') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Create user if doesn't exist
      const newUser = new User({
        email,
        googleId: email, // Using email as googleId for manually created users
        license: {
          isActive: true,
          stripeCustomerId: 'manual-activation',
        }
      });
      await newUser.save();
      return res.json({ message: 'User created and license activated', user: newUser });
    }

    // Update existing user
    user.license = {
      isActive: true,
      stripeCustomerId: user.license?.stripeCustomerId || 'manual-activation',
    };
    await user.save();

    res.json({ message: 'License activated successfully', user });
  } catch (error) {
    console.error('Admin set license error:', error);
    res.status(500).json({ error: 'Failed to set license status' });
  }
});

router.get('/check-purchase', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ hasPurchased: false });
    }

    res.json({
      hasPurchased: user.license?.isActive || false,
      license: user.license
    });
  } catch (error) {
    console.error('Check purchase error:', error);
    res.status(500).json({ error: 'Failed to check purchase status' });
  }
});

module.exports = router;