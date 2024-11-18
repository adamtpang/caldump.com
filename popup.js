// Store settings in chrome.storage
function saveSettings() {
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;

  chrome.storage.sync.set({
    startTime,
    endTime
  }, () => {
    showStatus('Settings saved!', 'success');
  });
}

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get(['startTime', 'endTime'], (result) => {
    if (result.startTime) {
      document.getElementById('startTime').value = result.startTime;
    }
    if (result.endTime) {
      document.getElementById('endTime').value = result.endTime;
    }
  });
}

// Handle clipboard paste
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('taskText').value = text;
  } catch (err) {
    showStatus('Failed to read clipboard', 'error');
  }
}

// Create calendar event
async function createCalendarEvent(task) {
  // Get settings
  const settings = await chrome.storage.sync.get(['startTime', 'endTime']);

  // Create event time based on settings
  const now = new Date();
  const [startHour, startMinute] = settings.startTime.split(':');
  const [endHour, endMinute] = settings.endTime.split(':');

  let startDate = new Date(now);
  startDate.setHours(parseInt(startHour), parseInt(startMinute), 0);

  // If current time is before start time, use today
  // If current time is after end time, use tomorrow
  if (now > startDate) {
    startDate.setDate(startDate.getDate() + 1);
  }

  const endDate = new Date(startDate);
  endDate.setHours(parseInt(endHour), parseInt(endMinute), 0);

  // TODO: Implement Google Calendar API integration
  // This will require OAuth2 authentication and API calls
  console.log('Creating event:', {
    summary: task,
    start: startDate,
    end: endDate
  });
}

// Show status message
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  setTimeout(() => {
    status.textContent = '';
    status.className = 'status';
  }, 3000);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('pasteTask').addEventListener('click', pasteFromClipboard);
  document.getElementById('addTask').addEventListener('click', () => {
    const task = document.getElementById('taskText').value;
    if (task) {
      createCalendarEvent(task);
    } else {
      showStatus('Please enter a task', 'error');
    }
  });
});