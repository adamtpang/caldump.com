import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, CircularProgress, Stack, Link } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Landing() {
    const { user, hasLicense, login, logout } = useAuth();
    const navigate = useNavigate();
    const [stripeLoaded, setStripeLoaded] = useState(false);

    useEffect(() => {
        if (user && hasLicense) {
            navigate('/app');
        }
        setStripeLoaded(true);
    }, [user, hasLicense, navigate]);

    const handleSwitchAccount = async () => {
        await logout();
        await login();
    };

    return (
        <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold" sx={{ mb: 1 }}>
                caldump.com
            </Typography>

            <Typography variant="h3" component="h2" gutterBottom color="primary" fontWeight="bold" sx={{ mb: 3, fontSize: { xs: '2rem', sm: '2.5rem' } }}>
                Bulk Schedule Google Calendar Events
            </Typography>

            {/* Key Benefits */}
            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <CheckCircleIcon color="primary" />
                    <Typography variant="body1">
                        Schedule multiple events in one go
                    </Typography>
                </Box>
            </Box>

            {!user ? (
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<GoogleIcon />}
                    onClick={login}
                    sx={{
                        mt: 2,
                        py: 2,
                        px: 6,
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                    }}
                >
                    Sign in with Google
                </Button>
            ) : !hasLicense ? (
                <Box sx={{ mt: 4 }}>
                    <Box sx={{ minHeight: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                            {!stripeLoaded && <CircularProgress size={30} sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
                            <stripe-buy-button
                                buy-button-id="buy_btn_1QUgqHFL7C10dNyGlq3U4URR"
                                publishable-key="pk_live_51J7Ti4FL7C10dNyGubXiYMWwF6jPahwvwDjXXooFE9VbI1Brh6igKsmNKAqmFoYflQveSCQ8WR1N47kowzJ1drrQ00ijl4Euus"
                            />
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<SwitchAccountIcon />}
                            onClick={handleSwitchAccount}
                            sx={{ height: 40 }}
                        >
                            Switch Account
                        </Button>
                    </Box>
                    <Typography variant="body2" color="primary" sx={{ mt: 2, fontWeight: 'medium' }}>
                        Use {user.email} for purchase
                    </Typography>
                </Box>
            ) : (
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/app')}
                    sx={{
                        mt: 2,
                        py: 2,
                        px: 6,
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                    }}
                >
                    Go to App
                </Button>
            )}

            <Box sx={{ mt: 3, opacity: 0.7 }}>
                <Link href="https://anchormarianas.com" target="_blank" rel="noopener" color="text.secondary" underline="hover">
                    anchormarianas.com
                </Link>
            </Box>
        </Container>
    );
}