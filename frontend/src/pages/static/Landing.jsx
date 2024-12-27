import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';

export default function Landing() {
    const { user, hasLicense, login, logout } = useAuth();
    const navigate = useNavigate();
    const [stripeLoaded, setStripeLoaded] = useState(false);

    useEffect(() => {
        if (user && hasLicense) {
            navigate('/app');
        }

        // Immediately show the button and let it handle its own loading state
        setStripeLoaded(true);
    }, [user, hasLicense, navigate]);

    const handleSwitchAccount = async () => {
        await logout();
        await login();
    };

    return (
        <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h3" component="h1" gutterBottom>
                caldump.com
            </Typography>

            <Typography variant="h5" component="h2" gutterBottom>
                bulk schedule calendar events
            </Typography>

            {!user ? (
                <Button
                    variant="contained"
                    startIcon={<GoogleIcon />}
                    onClick={login}
                    sx={{ mt: 4 }}
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
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Signed in as {user.email}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'medium' }}>
                        ⚡ Please use {user.email} to purchase your license
                    </Typography>
                </Box>
            ) : (
                <Button
                    variant="contained"
                    onClick={() => navigate('/app')}
                    sx={{ mt: 4 }}
                >
                    Go to App
                </Button>
            )}
        </Container>
    );
}