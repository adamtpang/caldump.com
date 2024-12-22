import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 8 }}>
                <Typography variant="h2" gutterBottom>
                    Welcome, {user?.displayName}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    You now have access to CalDump. Start scheduling your events!
                </Typography>
            </Box>
        </Container>
    );
};

export default Dashboard;