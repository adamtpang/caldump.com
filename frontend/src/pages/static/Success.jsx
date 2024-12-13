import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, CircularProgress, alpha, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SuccessContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(45deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%)`,
  },
}));

const ContentBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  maxWidth: 600,
  padding: theme.spacing(6),
  background: alpha(theme.palette.background.paper, 0.6),
  backdropFilter: 'blur(20px)',
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  position: 'relative',
  zIndex: 1,
}));

const SuccessIcon = styled('i')(({ theme }) => ({
  fontSize: '4rem',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(3),
  display: 'block',
}));

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const sessionId = searchParams.get('session_id');
  const purchaseEmail = searchParams.get('customer_email');

  useEffect(() => {
    const activateLicense = async () => {
      if (!sessionId || !user) return;

      // Check if emails match
      if (purchaseEmail && purchaseEmail !== user.email) {
        setError(`The email used for purchase (${purchaseEmail}) doesn't match your Google account (${user.email}). Please contact support.`);
        return;
      }

      try {
        // Wait a moment for Stripe webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Redirect to app
        navigate('/app');
      } catch (error) {
        console.error('Error activating license:', error);
        setError('Failed to activate license. Please try again or contact support.');
      }
    };

    activateLicense();
  }, [sessionId, user, navigate, purchaseEmail]);

  return (
    <SuccessContainer>
      <ContentBox>
        <SuccessIcon className="fas fa-calendar-check" />
        <Typography variant="h4" gutterBottom>
          Thank you for your purchase!
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              You're now getting access to caldump.com's powerful calendar scheduling features.
            </Typography>
            <Typography variant="body2" color="primary">
              Redirecting you to the app...
              <CircularProgress size={20} color="inherit" sx={{ ml: 2 }} />
            </Typography>
          </>
        )}
      </ContentBox>
    </SuccessContainer>
  );
};

export default Success;