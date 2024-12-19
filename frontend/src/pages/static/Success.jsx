import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';

const Success = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();
  const { user, verifyPurchaseStatus } = useAuth();

  useEffect(() => {
    const verifyPurchase = async () => {
      if (!user) {
        setError('Please sign in to verify your purchase.');
        setLoading(false);
        return;
      }

      try {
        console.log('Verifying purchase for:', user.email);
        const purchased = await verifyPurchaseStatus(user);
        console.log('Purchase verification result:', { purchased });

        setVerified(purchased);
        setLoading(false);

        if (purchased) {
          // Wait a moment before redirecting
          setTimeout(() => {
            navigate('/app');
          }, 2000);
        }
      } catch (err) {
        console.error('Error verifying purchase:', err);
        setError('Failed to verify purchase. Please try again or contact support.');
        setLoading(false);
      }
    };

    // Add a small delay to ensure the webhook has processed
    setTimeout(verifyPurchase, 2000);
  }, [user, verifyPurchaseStatus, navigate]);

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" p={3}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Verifying your purchase...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          If you believe this is an error, please contact support at support@caldump.com
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </Box>
    );
  }

  if (verified) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" p={3}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Thank you for your purchase! Your license has been activated.
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          You can now start using CalDump with your Google account: {user?.email}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Redirecting to the app...
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" p={3}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        Purchase verification pending. Please wait...
      </Alert>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This may take a few moments to process.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Return to Home
      </Button>
    </Box>
  );
};

export default Success;