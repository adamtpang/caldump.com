const express = require('express');
const router = express.Router();
const { createEvents } = require('../controllers/calendarController');
const auth = require('../middleware/auth');

router.post('/events', auth, createEvents);

module.exports = router;