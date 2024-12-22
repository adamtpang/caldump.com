import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyPurchaseStatus, user } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      const sessionId = searchParams.get('session_id');
      const customerEmail = searchParams.get('customer_email');

      console.log('Processing purchase with:', { sessionId, customerEmail });

      if (!user) {
        console.log('No user found, waiting for auth...');
        // Don't redirect immediately, wait for potential auth
        return;
      }

      try {
        console.log('Verifying purchase for user:', user.email);
        await verifyPurchaseStatus(user, { sessionId, customerEmail });
        console.log('Purchase verified successfully');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error verifying purchase:', error);
        setError('Failed to verify purchase. Please contact support if this persists.');
      }
    };

    checkPurchaseStatus();
  }, [user, verifyPurchaseStatus, navigate, searchParams]);

  if (error) {
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
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
          <Typography variant="body1" color="text.secondary">
            Contact support at support@caldump.com
          </Typography>
        </Box>
      </Container>
    );
  }

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