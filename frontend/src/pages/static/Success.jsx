import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyPurchaseStatus, user, login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Success page mounted');
    console.log('Current user:', user);
    console.log('URL params:', Object.fromEntries(searchParams.entries()));

    const checkPurchaseStatus = async () => {
      try {
        console.log('Verifying purchase for user:', user?.email);
        const result = await verifyPurchaseStatus(user);
        console.log('Verification result:', result);

        if (result?.licenseStatus) {
          console.log('License verified, redirecting to dashboard');
          navigate('/dashboard');
        } else {
          console.log('License not found');
          setError('License verification failed. Please try again or contact support.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setError('An error occurred during verification. Please contact support.');
      }
    };

    if (user) {
      checkPurchaseStatus();
    } else {
      console.log('No user found, showing sign-in prompt');
    }
  }, [user, verifyPurchaseStatus, navigate, searchParams]);

  const handleSignIn = async () => {
    try {
      console.log('Attempting sign in');
      await login();
      console.log('Sign in successful');
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in. Please try again.');
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
          <Typography variant="h4">Sign In Required</Typography>
          <Button variant="contained" onClick={handleSignIn}>Sign In with Google</Button>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
          <Alert severity="error">{error}</Alert>
          <Typography variant="body2">Contact support@caldump.com for assistance</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
        <CircularProgress />
        <Typography>Verifying your purchase...</Typography>
      </Box>
    </Container>
  );
};

export default Success;