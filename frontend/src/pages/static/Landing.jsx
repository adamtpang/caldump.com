import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';

export default function Landing() {
    const { user, hasLicense, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // If user has license, redirect to app
        if (user && hasLicense) {
            navigate('/app');
        }

        // Load Stripe script
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/buy-button.js';
        script.async = true;

        // Handle potential errors from ad blockers
        script.onerror = () => {
            console.warn('Stripe script loading was blocked. Payment functionality might be affected.');
        };

        // Suppress Stripe analytics errors
        window.addEventListener('unhandledrejection', event => {
            if (event.reason?.message?.includes('stripe.com')) {
                event.preventDefault();
            }
        });

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
            // Clean up error handling
            window.removeEventListener('unhandledrejection', event => {
                if (event.reason?.message?.includes('stripe.com')) {
                    event.preventDefault();
                }
            });
        };
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
                <Box sx={{ mt: 4 }}>
                    <stripe-buy-button
                        buy-button-id="buy_btn_1QUgqHFL7C10dNyGlq3U4URR"
                        publishable-key="pk_live_51J7Ti4FL7C10dNyGubXiYMWwF6jPahwvwDjXXooFE9VbI1Brh6igKsmNKAqmFoYflQveSCQ8WR1N47kowzJ1drrQ00ijl4Euus"
                    />
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