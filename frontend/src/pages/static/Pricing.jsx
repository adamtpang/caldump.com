import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const features = [
    'Schedule tasks automatically',
    'Intelligent time slot allocation',
    'Google Calendar integration',
    'Smart scheduling around existing events',
    'Lifetime access',
];

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
                        $9.99
                    </Typography>

                    <Typography
                        variant="subtitle1"
                        sx={{
                            mb: 4,
                            color: 'text.secondary'
                        }}
                    >
                        One-time payment
                    </Typography>

                    <List sx={{ mb: 4, textAlign: 'left' }}>
                        {features.map((feature, index) => (
                            <ListItem key={index} dense>
                                <ListItemIcon>
                                    <CheckCircleIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText primary={feature} />
                            </ListItem>
                        ))}
                    </List>

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