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
    styled,
    Link
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
    const [loading, setLoading] = useState(false);
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
            const availableSlots = await googleCalendarService.findAvailableSlots(
                startTime,
                endTime,
                30 // 30 minutes per task
            );

            if (availableSlots.length < taskList.length) {
                throw new Error('Not enough available time slots for all tasks');
            }

            // Create events for each task
            await googleCalendarService.createEvents(
                availableSlots.slice(0, taskList.length),
                taskList
            );

            // Clear tasks after successful scheduling
            setTasks('');
        } catch (error) {
            console.error('Error scheduling tasks:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <StyledAppBar position="sticky">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 'bold',
                            color: theme => theme.palette.primary.main,
                        }}
                    >
                        caldump.com
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={user?.photoURL}
                            alt={user?.displayName}
                            sx={{
                                width: 40,
                                height: 40,
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
                        disabled={loading}
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
                        disabled={loading || !tasks.trim()}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <EventIcon />}
                    >
                        {loading ? 'Scheduling...' : 'Schedule Events'}
                    </Button>
                </Paper>
            </Container>

            <Box sx={{ mt: 3, opacity: 0.7, textAlign: 'center' }}>
                <Link href="https://anchormarianas.com" target="_blank" rel="noopener" color="text.secondary" underline="hover">
                    anchormarianas.com
                </Link>
            </Box>
        </Box>
    );
}