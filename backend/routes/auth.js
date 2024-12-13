const express = require('express');
const router = express.Router();
const { verifyToken, getUser } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Verify Firebase token and create/update user
router.post('/verify-token', verifyToken);

// Get current user
router.get('/user', auth, getUser);

module.exports = router;