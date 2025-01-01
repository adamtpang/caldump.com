import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    AppBar,
    Toolbar,
    Avatar,
    IconButton,
    styled
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { googleCalendarService } from '../../services/googleCalendar';
import EventIcon from '@mui/icons-material/Event';
import LogoutIcon from '@mui/icons-material/Logout';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
}));

export default function Dashboard() {
    const { user, settings, logout } = useAuth();
    const [tasks, setTasks] = useState('');
    const [loading, setLoading] = useState('');
    const [error, setError] = useState(null);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleSchedule = async () => {
        try {
            setLoading(true);
            setError(null);

            // Split tasks by newline and filter out empty lines
            const taskList = tasks
                .split('\n')
                .map(task => task.trim())
                .filter(task => task.length > 0);

            if (taskList.length === 0) {
                throw new Error('Please add at least one task');
            }

            // Get today's date
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Set start and end times
            const startTime = new Date(today);
            const [startHours, startMinutes] = settings.startTime.split(':');
            startTime.setHours(parseInt(startHours), parseInt(startMinutes));

            const endTime = new Date(today);
            const [endHours, endMinutes] = settings.endTime.split(':');
            endTime.setHours(parseInt(endHours), parseInt(endMinutes));

            // Find available slots
            let availableSlots = await googleCalendarService.findAvailableSlots(
                startTime,
                endTime,
                30 // 30 minutes per task
            );

            // Keep only the slots we need
            availableSlots = availableSlots.slice(0, taskList.length);

            // Check if we have enough slots after getting them all
            if (availableSlots.length < taskList.length) {
                throw new Error(`Could only find ${availableSlots.length} available slots for ${taskList.length} tasks. Try a different time range or reduce the number of tasks.`);
            }

            // Create events for each task
            await googleCalendarService.createEvents(
                availableSlots,
                taskList,
                (progress) => {
                    setLoading(`Scheduling events (${progress.completed}/${progress.total})... ${progress.remainingSeconds} seconds remaining`);
                }
            );

            // Clear tasks after successful scheduling
            setTasks('');
            setLoading(false);
        } catch (error) {
            console.error('Error scheduling tasks:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <StyledAppBar position="sticky">
                <Container maxWidth="sm" disableGutters>
                    <Toolbar sx={{ px: '24px !important' }}>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                flexGrow: 1,
                                fontWeight: 'bold',
                                color: theme => theme.palette.primary.main,
                                ml: -1
                            }}
                        >
                            caldump.com
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: -1 }}>
                            <Avatar
                                src={user?.photoURL}
                                alt={user?.displayName}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    border: '2px solid white',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                            <IconButton
                                onClick={handleLogout}
                                sx={{
                                    color: theme => theme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                                title="Sign out"
                            >
                                <LogoutIcon />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </Container>
            </StyledAppBar>

            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <TextField
                        multiline
                        rows={8}
                        fullWidth
                        placeholder={`Enter your tasks (one per line), for example:

Team meeting with John
Review project proposal
Call with client
Prepare presentation`}
                        value={tasks}
                        onChange={(e) => setTasks(e.target.value)}
                        disabled={!!loading}
                        sx={{ mb: 3 }}
                    />

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSchedule}
                        disabled={!!loading || !tasks.trim()}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <EventIcon />}
                    >
                        {loading || 'Schedule Events'}
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
}