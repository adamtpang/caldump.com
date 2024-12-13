const express = require('express');
const router = express.Router();
const User = require('../models/User');
const admin = require('firebase-admin');

// Debug logging for route registration
console.log('Registering purchase routes...');

// Admin endpoint to manually set license status
router.post('/admin/set-license', async (req, res) => {
  console.log('Received set-license request:', req.body);
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
        googleId: email, // Temporary, will be updated when user signs in
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

// Admin endpoint to fix googleId for existing users
router.post('/admin/fix-google-id', async (req, res) => {
  console.log('Received fix-google-id request:', req.body);
  try {
    const { email, adminKey } = req.body;

    if (adminKey !== 'caldump-admin-2024') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    try {
      // Get Firebase user by email
      const firebaseUser = await admin.auth().getUserByEmail(email);
      console.log('Found Firebase user:', firebaseUser.uid);

      // Update googleId to Firebase UID
      user.googleId = firebaseUser.uid;
      await user.save();
      console.log('Updated user googleId:', user.googleId);

      res.json({
        message: 'GoogleId updated successfully',
        user: {
          email: user.email,
          googleId: user.googleId,
          license: user.license
        }
      });
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      res.status(400).json({
        error: 'Could not find Firebase user',
        details: firebaseError.message
      });
    }
  } catch (error) {
    console.error('Fix googleId error:', error);
    res.status(500).json({ error: 'Failed to update googleId' });
  }
});

router.get('/check-purchase', async (req, res) => {
  console.log('Received check-purchase request:', req.query);
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

// Export the router
module.exports = router;