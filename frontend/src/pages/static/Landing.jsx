import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';

export default function Landing() {
    const { user, hasLicense, login } = useAuth();
    const navigate = useNavigate();
    const [stripeLoaded, setStripeLoaded] = useState(false);

    useEffect(() => {
        // If user has license, redirect to app
        if (user && hasLicense) {
            navigate('/app');
        }

        // Check if Stripe is already loaded
        if (window.customElements.get('stripe-buy-button')) {
            setStripeLoaded(true);
            return;
        }

        let attempts = 0;
        const maxAttempts = 50; // 5 seconds total wait time

        // Wait for Stripe to load
        const checkStripe = setInterval(() => {
            attempts++;
            if (window.customElements.get('stripe-buy-button')) {
                setStripeLoaded(true);
                clearInterval(checkStripe);
            } else if (attempts >= maxAttempts) {
                // Force show after 5 seconds even if not detected
                setStripeLoaded(true);
                clearInterval(checkStripe);
            }
        }, 100);

        // Clean up interval
        return () => clearInterval(checkStripe);
    }, [user, hasLicense, navigate]);

    return (
        <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h3" component="h1" gutterBottom>
                caldump.com
            </Typography>

            <Typography variant="h5" component="h2" gutterBottom>
                bulk schedule calendar events
            </Typography>

            {!user ? (
                // Not signed in - show sign in button
                <Button
                    variant="contained"
                    startIcon={<GoogleIcon />}
                    onClick={login}
                    sx={{ mt: 4 }}
                >
                    Sign in with Google
                </Button>
            ) : !hasLicense ? (
                // Signed in but no license - show Stripe button
                <Box sx={{ mt: 4, minHeight: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {!stripeLoaded ? (
                        <CircularProgress size={30} />
                    ) : (
                        <stripe-buy-button
                            buy-button-id="buy_btn_1QUgqHFL7C10dNyGlq3U4URR"
                            publishable-key="pk_live_51J7Ti4FL7C10dNyGubXiYMWwF6jPahwvwDjXXooFE9VbI1Brh6igKsmNKAqmFoYflQveSCQ8WR1N47kowzJ1drrQ00ijl4Euus"
                        />
                    )}
                </Box>
            ) : (
                // Has license - show link to app
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