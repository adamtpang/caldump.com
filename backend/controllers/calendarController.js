const { google } = require('googleapis');
const User = require('../models/User');

// Create a new OAuth2 client with credentials
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.FRONTEND_URL}/app`
);

exports.createEvents = async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.license?.isActive) {
      return res.status(403).json({ error: 'Active license required' });
    }

    // Get a new access token using Firebase user's token
    const tokenResponse = await oauth2Client.getToken(req.body.code);
    oauth2Client.setCredentials(tokenResponse.tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const { tasks } = req.body;

    const results = [];
    const now = new Date();
    let currentDate = new Date(now);

    // Reset to user's start time
    const [startHour, startMinute] = user.settings.startTime.split(':');
    currentDate.setHours(parseInt(startHour), parseInt(startMinute), 0);

    // If current time is past start time, move to next day
    if (now > currentDate) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Process each task
    for (const task of tasks) {
      try {
        const endDate = new Date(currentDate);
        endDate.setMinutes(endDate.getMinutes() + 30); // 30-minute events

        const event = {
          summary: task,
          start: {
            dateTime: currentDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        };

        await calendar.events.insert({
          calendarId: 'primary',
          resource: event
        });

        results.push({ task, success: true });

        // Set up next event time
        currentDate = new Date(endDate);

        // Check if we've hit end time
        const [endHour, endMinute] = user.settings.endTime.split(':');
        const endTime = new Date(currentDate);
        endTime.setHours(parseInt(endHour), parseInt(endMinute), 0);

        if (currentDate >= endTime) {
          // Move to next day's start time
          currentDate.setDate(currentDate.getDate() + 1);
          currentDate.setHours(parseInt(startHour), parseInt(startMinute), 0);
        }
      } catch (error) {
        console.error('Calendar event creation error:', error);
        results.push({ task, success: false, error: error.message });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('Calendar controller error:', error);
    res.status(500).json({ error: 'Failed to create calendar events' });
  }
};

// Get OAuth2 URL for Google Calendar authorization
exports.getAuthUrl = async (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: req.user.uid
    });

    res.json({ url });
  } catch (error) {
    console.error('Get auth URL error:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
};