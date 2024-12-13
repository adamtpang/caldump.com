import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  IconButton,
  Divider,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { useNavigate } from 'react-router-dom';

const Header = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  position: 'sticky',
  top: 0,
  zIndex: 100,
}));

const MainContent = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const TaskInput = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  background: alpha(theme.palette.background.paper, 0.6),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const Product = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState('');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskList = tasks.split('\n').filter(task => task.trim());
    console.log('Tasks to schedule:', taskList);
    // TODO: Implement calendar scheduling
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(45deg, #000000 0%, #1a1a1a 100%)' }}>
      <Header>
        <Container>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              caldump
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton color="primary" size="small">
                <SettingsIcon />
              </IconButton>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  src={user?.photoURL}
                  alt={user?.displayName}
                  sx={{ width: 32, height: 32 }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {user?.displayName}
                </Typography>
              </Box>

              <IconButton onClick={handleLogout} color="primary" size="small">
                <LogoutIcon />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Header>

      <MainContent maxWidth="md">
        <TaskInput elevation={0}>
          <Typography variant="h5" gutterBottom>
            Dump Your Tasks
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Paste your tasks below, one per line. We'll schedule them in your calendar.
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              multiline
              rows={8}
              fullWidth
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder="Example:
Write blog post
Review PRs
Team meeting prep
..."
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={!tasks.trim()}
            >
              Schedule Tasks
            </Button>
          </form>
        </TaskInput>

        {/* TODO: Add scheduling preferences */}
        {/* TODO: Add calendar preview */}
      </MainContent>
    </Box>
  );
};

export default Product;