import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function Pricing() {
    const { redirectToCheckout } = useAuth();

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

                    <Button
                        variant="contained"
                        size="large"
                        onClick={redirectToCheckout}
                        sx={{
                            py: 1.5,
                            px: 4,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1.1rem'
                        }}
                    >
                        Buy Now
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
}