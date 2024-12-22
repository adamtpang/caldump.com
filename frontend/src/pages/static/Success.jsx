import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyPurchaseStatus, user } = useAuth();

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (user) {
        try {
          await verifyPurchaseStatus(user);
          // Redirect to dashboard after verification
          navigate('/dashboard');
        } catch (error) {
          console.error('Error verifying purchase:', error);
          // On error, redirect to home page
          navigate('/');
        }
      } else {
        // If no user, redirect to home page
        navigate('/');
      }
    };

    checkPurchaseStatus();
  }, [user, verifyPurchaseStatus, navigate]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 4
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h4" gutterBottom>
          Processing Your Purchase
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please wait while we verify your purchase...
        </Typography>
      </Box>
    </Container>
  );
};

export default Success;