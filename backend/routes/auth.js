const express = require('express');
const router = express.Router();
const { googleAuth, getUser } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/google', googleAuth);
router.get('/user', auth, getUser);

module.exports = router;