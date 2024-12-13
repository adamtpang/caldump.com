import React, { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

const Success = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const verifyPurchase = async () => {
      if (!user) {
        setError('Please sign in to verify your purchase.');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');
      const customerEmail = params.get('customer_email');

      if (!sessionId) {
        setError('Invalid session ID.');
        setLoading(false);
        return;
      }

      if (customerEmail !== user.email) {
        setError(`The email used for purchase (${customerEmail}) doesn't match your Google account (${user.email}). Please contact support.`);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/purchases/check-purchase?email=${encodeURIComponent(user.email)}`);
        if (!response.ok) {
          throw new Error('Failed to verify purchase');
        }
        const data = await response.json();
        setVerified(data.hasPurchased);
        setLoading(false);
      } catch (err) {
        console.error('Error checking license:', err);
        setError('Failed to verify purchase. Please try again or contact support.');
        setLoading(false);
      }
    };

    verifyPurchase();
  }, [location.search, user, apiUrl]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          If you believe this is an error, please contact support at support@caldump.com
        </Typography>
      </Box>
    );
  }

  if (verified) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" p={3}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Thank you for your purchase! Your license has been activated.
        </Alert>
        <Typography variant="body1">
          You can now start using CalDump with your Google account: {user?.email}
        </Typography>
      </Box>
    );
  }

  return <Navigate to="/" replace />;
};

export default Success;