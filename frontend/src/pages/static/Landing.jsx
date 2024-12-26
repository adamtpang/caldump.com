import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';

export default function Landing() {
    const { login } = useAuth();

    const handleGoogleSignIn = async () => {
        try {
            await login();
        } catch (error) {
            console.error('Error signing in:', error);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'background.default'
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 2
                    }}
                >
                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                            mb: 2,
                            fontWeight: 'bold',
                            color: theme => theme.palette.primary.main
                        }}
                    >
                        caldump.com
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            mb: 4,
                            color: 'text.secondary'
                        }}
                    >
                        Dump your tasks, we'll schedule them.
                    </Typography>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleGoogleSignIn}
                        startIcon={<GoogleIcon />}
                        sx={{
                            py: 1.5,
                            px: 4,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1.1rem'
                        }}
                    >
                        Continue with Google
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
}