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

        // Suppress Stripe analytics errors
        const handleStripeError = (event) => {
            // Check if error is from Stripe
            if (
                event.reason?.message?.includes('stripe.com') ||
                event.reason?.message?.includes('Failed to fetch') ||
                event.target?.src?.includes('stripe.com')
            ) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        };

        // Add error handlers
        window.addEventListener('unhandledrejection', handleStripeError);
        window.addEventListener('error', handleStripeError, true);

        // Load Stripe script
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/buy-button.js';
        script.async = true;
        script.onerror = (e) => {
            e.preventDefault();
            console.warn('Stripe script loading was blocked by an ad blocker. This is normal and won\'t affect functionality.');
        };

        // Patch fetch to suppress Stripe analytics errors
        const originalFetch = window.fetch;
        window.fetch = function (url, options) {
            if (url.toString().includes('stripe.com/b') || url.toString().includes('stripe.com/api')) {
                return Promise.resolve(); // Silently succeed for analytics calls
            }
            return originalFetch.apply(this, arguments);
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
            window.removeEventListener('unhandledrejection', handleStripeError);
            window.removeEventListener('error', handleStripeError, true);
            window.fetch = originalFetch;
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