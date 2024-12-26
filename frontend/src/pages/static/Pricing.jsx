import React, { useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function Pricing() {
    const { user } = useAuth();

    useEffect(() => {
        // Load Stripe Buy Button script
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/buy-button.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

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
                        variant="h4"
                        sx={{ mb: 1 }}
                    >
                        $10
                    </Typography>

                    <Typography
                        variant="subtitle1"
                        sx={{
                            mb: 4,
                            color: 'text.secondary'
                        }}
                    >
                        One-time payment for lifetime access
                    </Typography>

                    <stripe-buy-button
                        buy-button-id="buy_btn_1QUgqHFL7C10dNyGlq3U4URR"
                        publishable-key="pk_live_51J7Ti4FL7C10dNyGubXiYMWwF6jPahwvwDjXXooFE9VbI1Brh6igKsmNKAqmFoYflQveSCQ8WR1N47kowzJ1drrQ00ijl4Euus"
                        client-reference-id={user?.uid}
                        customer-email={user?.email}
                    />
                </Paper>
            </Container>
        </Box>
    );
}