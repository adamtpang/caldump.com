import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyPurchaseStatus, user, login } = useAuth();
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      const sessionId = searchParams.get('session_id');
      const customerEmail = searchParams.get('customer_email');

      console.log('Processing purchase with:', { sessionId, customerEmail, retryCount });

      if (!user) {
        if (retryCount < MAX_RETRIES) {
          console.log('No user found, retrying in 2 seconds...');
          setTimeout(() => setRetryCount(prev => prev + 1), RETRY_DELAY);
          return;
        }
        setError('Please sign in to verify your purchase.');
        return;
      }

      try {
        console.log('Verifying purchase for user:', user.email);
        await verifyPurchaseStatus(user, { sessionId, customerEmail });
        console.log('Purchase verified successfully');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error verifying purchase:', error);
        if (retryCount < MAX_RETRIES) {
          console.log('Verification failed, retrying in 2 seconds...');
          setTimeout(() => setRetryCount(prev => prev + 1), RETRY_DELAY);
        } else {
          setError('Failed to verify purchase. Please try signing in again or contact support.');
        }
      }
    };

    checkPurchaseStatus();
  }, [user, verifyPurchaseStatus, navigate, searchParams, retryCount]);

  const handleSignIn = async () => {
    try {
      await login();
      setError(null);
      setRetryCount(0); // Reset retry count to trigger verification again
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Failed to sign in. Please try again or contact support.');
    }
  };

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
          <Button
            variant="contained"
            color="primary"
            onClick={handleSignIn}
            sx={{ mt: 2 }}
          >
            Sign In with Google
          </Button>
          <Typography variant="body2" color="text.secondary">
            If the problem persists, contact support at support@caldump.com
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
          {retryCount > 0 && ` (Attempt ${retryCount + 1}/${MAX_RETRIES})`}
        </Typography>
      </Box>
    </Container>
  );
};

export default Success;