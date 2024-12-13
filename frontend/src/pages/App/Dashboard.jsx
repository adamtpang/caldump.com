import React, { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import axios from 'axios';
import { format, parse } from 'date-fns';

const Dashboard = () => {
  const [tasks, setTasks] = useState('');
  const [startTime, setStartTime] = useState(new Date().setHours(9, 0, 0));
  const [endTime, setEndTime] = useState(new Date().setHours(17, 0, 0));
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: 'success' });

  const showStatus = (message, type = 'success') => {
    setStatus({ message, type });
    setTimeout(() => setStatus({ message: '', type: 'success' }), 5000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTasks(text);
    } catch (err) {
      showStatus('Failed to read clipboard', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tasks.trim()) {
      showStatus('Please enter at least one task', 'error');
      return;
    }

    setLoading(true);
    try {
      const taskList = tasks.split('\n').filter(task => task.trim());

      // Format times for API
      const formattedStartTime = format(new Date(startTime), 'HH:mm');
      const formattedEndTime = format(new Date(endTime), 'HH:mm');

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/calendar/events`, {
        tasks: taskList,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('caldump_token')}`,
        },
      });

      if (response.data.results) {
        const successCount = response.data.results.filter(r => r.success).length;
        showStatus(`Successfully scheduled ${successCount} out of ${taskList.length} tasks`);
        setTasks('');
      }
    } catch (error) {
      console.error('Error scheduling tasks:', error);
      showStatus(error.response?.data?.error || 'Failed to schedule tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Schedule Your Tasks
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Enter each task on a new line. Tasks will be scheduled as 30-minute events between your selected time range.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                placeholder="Paste your tasks here (one per line)"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handlePaste} disabled={loading}>
                        <ContentPasteIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TimePicker
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
                disabled={loading}
                views={['hours', 'minutes']}
                format="HH:mm"
              />
              <TimePicker
                label="End Time"
                value={endTime}
                onChange={setEndTime}
                disabled={loading}
                views={['hours', 'minutes']}
                format="HH:mm"
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || !tasks.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <CalendarMonthIcon />}
            >
              {loading ? 'Scheduling...' : 'Schedule Tasks'}
            </Button>

            {status.message && (
              <Typography
                variant="body2"
                color={status.type === 'error' ? 'error' : 'success.main'}
                sx={{ mt: 2, textAlign: 'center' }}
              >
                {status.message}
              </Typography>
            )}
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default Dashboard;