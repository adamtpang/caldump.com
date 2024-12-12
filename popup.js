// Store settings in chrome.storage
function saveSettings() {
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;

  console.log('Attempting to save settings:', { startTime, endTime });

  // Validate times
  if (!startTime || !endTime) {
    console.error('Missing time values:', { startTime, endTime });
    showStatus('Please set both start and end times', 'error');
    return;
  }

  chrome.storage.sync.set({
    startTime,
    endTime
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving settings:', chrome.runtime.lastError);
      showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
    } else {
      console.log('Settings saved successfully:', { startTime, endTime });
      showStatus('Settings saved!', 'success');
      // Hide settings panel after successful save
      document.getElementById('settingsPanel').classList.add('hidden');
      document.getElementById('toggleSettings').classList.remove('active');
    }
  });
}

// Load saved settings
function loadSettings() {
  console.log('Loading settings...');
  chrome.storage.sync.get({
    startTime: '09:00',
    endTime: '17:00'
  }, (result) => {
    if (chrome.runtime.lastError) {
      console.error('Error loading settings:', chrome.runtime.lastError);
      showStatus('Error loading settings', 'error');
    } else {
      console.log('Settings loaded:', result);
      document.getElementById('startTime').value = result.startTime;
      document.getElementById('endTime').value = result.endTime;
    }
  });
}

// Get OAuth2 token
async function getAuthToken(interactive = true) {
  try {
    console.log('Getting auth token, interactive:', interactive);
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive }, (token) => {
        if (chrome.runtime.lastError) {
          console.error('Auth token error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else if (!token) {
          console.error('No token received');
          reject(new Error('No token received'));
        } else {
          console.log('Auth token received successfully');
          resolve(token);
        }
      });
    });
  } catch (error) {
    console.error('Error in getAuthToken:', error);
    throw error;
  }
}

// Create calendar event
async function createCalendarEvent(task) {
  try {
    console.log('Step 1: Starting calendar event creation for task:', task);

    // Get settings
    console.log('Step 2: Retrieving settings from storage...');
    const settings = await chrome.storage.sync.get(['startTime', 'endTime']);
    console.log('Retrieved settings:', settings);

    // Check if settings exist
    if (!settings.startTime || !settings.endTime) {
      console.error('Step 2 Failed: Missing time settings');
      showStatus('Please set start and end times first', 'error');
      return;
    }

    // Find next available time slot
    console.log('Step 3: Finding next available time slot...');
    const now = new Date();
    const [startHour, startMinute] = settings.startTime.split(':');
    const [endHour, endMinute] = settings.endTime.split(':');

    // Set up the search window (7 days)
    const maxDaysToSearch = 7;
    const eventDurationMinutes = 30;
    let currentDate = new Date(now);

    // For today, start from current time if it's within working hours
    if (currentDate.getHours() >= parseInt(startHour) &&
        currentDate.getHours() < parseInt(endHour)) {
      // Round up to the next 30-minute slot
      const minutes = currentDate.getMinutes();
      const roundedMinutes = Math.ceil(minutes / eventDurationMinutes) * eventDurationMinutes;
      currentDate.setMinutes(roundedMinutes, 0, 0);
    } else if (currentDate.getHours() < parseInt(startHour)) {
      // If it's before start time today, start at start time
      currentDate.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
    } else {
      // If it's after end time, move to next day's start time
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
    }

    // Get existing events for the next 7 days
    const endSearch = new Date(now);
    endSearch.setDate(endSearch.getDate() + maxDaysToSearch);
    endSearch.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    const token = await getAuthToken();
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${currentDate.toISOString()}&timeMax=${endSearch.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!calendarResponse.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    const calendar = await calendarResponse.json();
    const existingEvents = calendar.items || [];

    // Find first available slot
    let foundSlot = false;
    let startDate, endDate;

    while (!foundSlot && currentDate < endSearch) {
      // Only check during working hours
      if (currentDate.getHours() >= parseInt(startHour) &&
          currentDate.getHours() < parseInt(endHour)) {

        // Check if this slot conflicts with existing events
        const slotEnd = new Date(currentDate);
        slotEnd.setMinutes(slotEnd.getMinutes() + eventDurationMinutes);

        const hasConflict = existingEvents.some(event => {
          const eventStart = event.start?.dateTime ? new Date(event.start.dateTime) :
                           event.start?.date ? new Date(event.start.date) : null;
          const eventEnd = event.end?.dateTime ? new Date(event.end.dateTime) :
                          event.end?.date ? new Date(event.end.date) : null;

          if (!eventStart || !eventEnd) return false;
          return currentDate < eventEnd && slotEnd > eventStart;
        });

        if (!hasConflict) {
          foundSlot = true;
          startDate = new Date(currentDate);
          endDate = new Date(slotEnd);
          break;
        }
      }

      // Move to next slot
      currentDate.setMinutes(currentDate.getMinutes() + eventDurationMinutes);

      // If we've passed end time, move to next day's start time
      if (currentDate.getHours() >= parseInt(endHour)) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
      }
    }

    if (!foundSlot) {
      throw new Error('No available slots in the next 7 days');
    }

    console.log('Found available slot:', {
      start: startDate.toLocaleString(),
      end: endDate.toLocaleString()
    });

    // Create the event
    const event = {
      summary: task,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create calendar event');
    }

    const createdEvent = await response.json();
    console.log('Event created successfully:', createdEvent);
    return startDate; // Return the scheduled time for progress reporting

  } catch (error) {
    console.error('Full error object:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw error; // Re-throw to handle in createCalendarEvents
  }
}

// Create calendar events for multiple tasks
async function createCalendarEvents(tasksText) {
  const tasks = tasksText.split('\n').filter(task => task.trim());
  console.log('Processing tasks:', tasks);

  // Get current settings
  const settings = await chrome.storage.sync.get(['startTime', 'endTime']);

  // Send tasks to background script
  chrome.runtime.sendMessage({
    action: 'scheduleTasks',
    tasks: tasks,
    settings: settings
  }, response => {
    if (response.received) {
      showStatus('Tasks are being scheduled in the background', 'success');
      document.getElementById('taskText').value = ''; // Clear the input
    }
  });
}

// Show status message
function showStatus(message, type) {
  console.log('Status:', message, type);
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.classList.remove('hidden');

  if (type === 'success') {
    setTimeout(() => {
      status.classList.add('hidden');
    }, 3000);
  }
}

// Toggle settings panel
function toggleSettings() {
  const settingsPanel = document.getElementById('settingsPanel');
  const toggleButton = document.getElementById('toggleSettings');
  settingsPanel.classList.toggle('hidden');
  toggleButton.classList.toggle('active');
}

// Move the state check outside the DOMContentLoaded listener
function checkSchedulingState() {
  try {
    chrome.runtime.sendMessage({ action: 'getSchedulingState' }, (state) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting state:', chrome.runtime.lastError.message);
        return;
      }

      console.log('Received state:', state);
      if (state && state.isScheduling) {
        updateUIForScheduling(state);
      }
    });
  } catch (error) {
    console.error('Error in checkSchedulingState:', error);
  }
}

// Check for existing auth and update UI
async function checkExistingAuth() {
  try {
    console.log('Checking for existing auth...');
    const token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(token);
        }
      });
    });

    if (token) {
      console.log('Found existing token, fetching user info...');
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      const userInfo = await response.json();
      console.log('Got user info:', userInfo.email);

      // Update UI with account info
      const signInPrompt = document.getElementById('signInPrompt');
      const accountInfo = document.getElementById('accountInfo');
      const userEmailElement = document.getElementById('userEmail');

      if (signInPrompt && accountInfo && userEmailElement) {
        signInPrompt.classList.add('hidden');
        accountInfo.classList.remove('hidden');
        userEmailElement.textContent = userInfo.email;
        console.log('Updated UI with email:', userInfo.email);

        // Check license since we're already authenticated
        await checkLicenseAndUpdateUI();
      } else {
        console.error('Missing UI elements:', { signInPrompt, accountInfo, userEmailElement });
      }

      // Store auth info
      await chrome.storage.local.set({
        googleAuth: {
          token: token,
          email: userInfo.email,
          timestamp: Date.now()
        }
      });

      return true;
    }
  } catch (error) {
    console.log('No existing auth found:', error);
  }
  return false;
}

// Remove existing token and force account picker
async function removeExistingToken() {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: false }, async (existingToken) => {
      if (existingToken) {
        console.log('Found existing token, removing...');
        try {
          // Remove from Chrome's cache
          await new Promise((innerResolve) => {
            chrome.identity.removeCachedAuthToken({ token: existingToken }, innerResolve);
          });

          // Revoke access
          const revokeResponse = await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${existingToken}`);
          if (revokeResponse.ok) {
            console.log('Access revoked successfully');
          }

          // Remove token from Chrome identity
          chrome.identity.clearAllCachedAuthTokens(() => {
            console.log('All cached tokens cleared');
            resolve();
          });
        } catch (error) {
          console.log('Error removing token:', error);
          resolve();
        }
      } else {
        resolve();
      }
    });
  });
}

// Handle Google Sign In
async function handleGoogleSignIn(e) {
  e.preventDefault();
  console.log('Sign in button clicked');

  const signInButton = document.getElementById('signInButton');
  const spinner = signInButton.querySelector('.spinner');
  const buttonText = signInButton.querySelector('.button-text');

  // Show loading state immediately
  signInButton.disabled = true;
  spinner.classList.remove('hidden');
  buttonText.classList.add('hidden');

  try {
    console.log('Starting Google sign-in process...');

    // First, remove any existing tokens
    await removeExistingToken();

    // Clear any stored auth data
    await chrome.storage.local.remove('googleAuth');

    // Get new token with account picker
    const token = await new Promise((resolve, reject) => {
      const options = {
        interactive: true,
        scopes: [
          'https://www.googleapis.com/auth/calendar.events',
          'https://www.googleapis.com/auth/userinfo.email'
        ]
      };

      // Force account selection
      chrome.identity.getAuthToken(options, async (token) => {
        if (chrome.runtime.lastError) {
          console.error('Auth error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          // Remove this token to force new selection next time
          await chrome.identity.removeCachedAuthToken({ token });
          resolve(token);
        }
      });
    });

    if (token) {
      console.log('Got auth token, fetching user info...');
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status} ${response.statusText}`);
      }

      const userInfo = await response.json();
      console.log('Got user info:', userInfo.email);

      // Store token for later use
      await chrome.storage.local.set({
        googleAuth: {
          token: token,
          email: userInfo.email,
          timestamp: Date.now()
        }
      });

      // Update UI with account info
      document.getElementById('signInPrompt').classList.add('hidden');
      document.getElementById('accountInfo').classList.remove('hidden');
      document.getElementById('userEmail').textContent = userInfo.email;

      // Check license
      await checkLicenseAndUpdateUI();
    }
  } catch (error) {
    console.error('Sign in error:', error);
    showStatus(`Failed to connect: ${error.message}`, 'error');
  } finally {
    // Reset button state
    signInButton.disabled = false;
    spinner.classList.add('hidden');
    buttonText.classList.remove('hidden');
  }
}

// Handle account switch
async function handleSwitchAccount() {
  const switchButton = document.getElementById('switchAccount');
  switchButton.disabled = true;

  try {
    // Remove existing token and force new selection
    await removeExistingToken();

    // Clear stored auth info
    await chrome.storage.local.remove('googleAuth');

    // Reset UI to sign-in state
    document.getElementById('signInPrompt').classList.remove('hidden');
    document.getElementById('accountInfo').classList.add('hidden');
    document.getElementById('mainContent').classList.add('hidden');
    document.getElementById('licenseRequired').classList.add('hidden');

    // Trigger sign in flow again
    await handleGoogleSignIn({ preventDefault: () => {} });
  } catch (error) {
    console.error('Account switch error:', error);
    showStatus('Failed to switch accounts', 'error');
  } finally {
    switchButton.disabled = false;
  }
}

// Check license and show appropriate content
async function checkLicenseAndUpdateUI() {
  const licenseRequired = document.getElementById('licenseRequired');
  const mainContent = document.getElementById('mainContent');
  const signInPrompt = document.getElementById('signInPrompt');
  const accountInfo = document.getElementById('accountInfo');
  const calendarLinks = document.querySelector('.calendar-links');
  const licenseInfo = document.querySelector('.license-info');

  try {
    // Get stored auth info
    const auth = await chrome.storage.local.get('googleAuth');
    const isAuthenticated = auth.googleAuth && auth.googleAuth.token;

    if (!isAuthenticated) {
      // Not logged in - show only Google sign in
      signInPrompt.classList.remove('hidden');
      accountInfo.classList.add('hidden');
      licenseRequired.classList.add('hidden');
      mainContent.classList.add('hidden');
      calendarLinks.classList.add('hidden');
      return;
    }

    // Update UI with stored email
    signInPrompt.classList.add('hidden');
    accountInfo.classList.remove('hidden');
    document.getElementById('userEmail').textContent = auth.googleAuth.email;

    // Check license
    const licenseStatus = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'check_license' }, function(response) {
        resolve(response);
      });
    });

    console.log('License status:', licenseStatus);

    if (licenseStatus.active) {
      // Has valid license with matching emails - show main app
      licenseRequired.classList.add('hidden');
      mainContent.classList.remove('hidden');
      calendarLinks.classList.remove('hidden');
    } else {
      // No valid license - show purchase section
      licenseRequired.classList.remove('hidden');
      mainContent.classList.add('hidden');
      calendarLinks.classList.add('hidden');

      // Show email mismatch message if applicable
      if (licenseStatus.stripeEmail) {
        licenseInfo.classList.remove('hidden');
        document.getElementById('purchaseEmail').textContent = licenseStatus.stripeEmail;

        if (!licenseStatus.emailsMatch) {
          showStatus(
            `Your Google Calendar email (${licenseStatus.googleEmail}) must match your purchase email (${licenseStatus.stripeEmail})`,
            'error'
          );
        }
      } else {
        licenseInfo.classList.add('hidden');
      }
    }
  } catch (error) {
    console.error('Error checking status:', error);
    showStatus('Error checking status', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');

  // Add Google sign in button listener
  const signInButton = document.getElementById('signInButton');
  if (signInButton) {
    console.log('Found sign in button, adding click listener');
    signInButton.addEventListener('click', handleGoogleSignIn);
  } else {
    console.error('Sign in button not found!');
  }

  // Add switch account button listener
  const switchButton = document.getElementById('switchAccount');
  if (switchButton) {
    switchButton.addEventListener('click', handleSwitchAccount);
  }

  // Add settings panel listeners
  document.getElementById('toggleSettings').addEventListener('click', toggleSettings);
  document.getElementById('saveSettings').addEventListener('click', saveSettings);

  // Check auth status and update UI once
  checkLicenseAndUpdateUI();
});

// Reset UI state
function resetUI() {
  const button = document.getElementById('addTask');
  const spinner = button.querySelector('.spinner');
  const buttonText = button.querySelector('.button-text');

  button.disabled = false;
  spinner.classList.add('hidden');
  buttonText.textContent = 'Add to Calendar';
  document.getElementById('cancelScheduling').classList.add('hidden');
}

// Validate time inputs
function validateTimes() {
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;

  if (startTime && endTime) {
    const [startHour, startMinute] = startTime.split(':');
    const [endHour, endMinute] = endTime.split(':');

    if (parseInt(endHour) < parseInt(startHour) ||
        (parseInt(endHour) === parseInt(startHour) && parseInt(endMinute) <= parseInt(startMinute))) {
      showStatus('End time must be after start time', 'error');
      return false;
    }
  }
  return true;
}

let isScheduling = false;

// Add message listener for progress updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'progressUpdate') {
    updateUIForScheduling(message.state);
  }
  if (message.action === 'schedulingError') {
    showStatus('Error: ' + message.error, 'error');
    resetUI();
  }
});

function updateUIForScheduling(state) {
  if (!state) {
    console.error('Invalid state received');
    return;
  }

  const button = document.getElementById('addTask');
  const spinner = button.querySelector('.spinner');
  const buttonText = button.querySelector('.button-text');

  if (state.isScheduling) {
    button.disabled = true;
    spinner.classList.remove('hidden');
    const total = (state.tasksRemaining?.length || 0) + (state.tasksCompleted?.length || 0);
    buttonText.textContent = `Scheduling (${state.tasksCompleted?.length || 0}/${total})`;

    // Show cancel button
    document.getElementById('cancelScheduling').classList.remove('hidden');
  } else {
    resetUI();
  }
}