const express = require('express');
const router = express.Router();
const { createEvents, getAuthUrl } = require('../controllers/calendarController');
const auth = require('../middleware/auth');

// Get Google Calendar auth URL
router.get('/auth-url', auth, getAuthUrl);

// Create calendar events
router.post('/events', auth, createEvents);

module.exports = router;