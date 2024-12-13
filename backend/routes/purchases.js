const express = require('express');
const router = express.Router();
const User = require('../models/User');

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