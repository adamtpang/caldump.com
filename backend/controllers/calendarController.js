const { google } = require('googleapis');
const User = require('../models/User');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.FRONTEND_URL
);

exports.createEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.license?.isActive) {
      return res.status(403).json({ error: 'Active license required' });
    }

    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken
    });

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
            timeZone: 'UTC'
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: 'UTC'
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
        results.push({ task, success: false, error: error.message });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('Calendar error:', error);
    res.status(500).json({ error: 'Failed to create calendar events' });
  }
};