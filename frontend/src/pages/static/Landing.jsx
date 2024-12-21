import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Container, Typography, Button, Avatar, alpha, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const StyledHeader = styled('header')(({ theme }) => ({
  background: 'transparent',
  position: 'fixed',
  width: '100%',
  top: 0,
  zIndex: 100,
  padding: theme.spacing(2, 0),
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha(theme.palette.background.default, 0.8),
}));

const Logo = styled(Link)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  textDecoration: 'none',
  textTransform: 'lowercase',
  '&:hover': {
    color: theme.palette.primary.light,
  },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  background: `linear-gradient(45deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
  position: 'relative',
  overflow: 'hidden',
  paddingTop: theme.spacing(8),
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

const FeatureCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  background: alpha(theme.palette.background.paper, 0.6),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 24px -10px ${alpha(theme.palette.primary.main, 0.3)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

const FeatureIcon = styled('i')(({ theme }) => ({
  fontSize: '2.5rem',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  display: 'block',
}));

const BuyButtonContainer = styled(Box)(({ theme }) => ({
  minHeight: '100px',
  margin: theme.spacing(4, 0),
}));

const StripeBuyButton = ({ email }) => {
  const buttonRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Suppress Stripe analytics errors
    const originalOnError = window.onerror;
    const originalOnUnhandledRejection = window.onunhandledrejection;

    window.onerror = (message, source, lineno, colno, error) => {
      if (source?.includes('stripe.com') || message?.includes('stripe.com')) {
        return true; // Prevent error from bubbling up
      }
      return originalOnError?.(message, source, lineno, colno, error);
    };

    window.onunhandledrejection = (event) => {
      if (event.reason?.message?.includes('stripe.com') ||
        event.reason?.stack?.includes('stripe.com')) {
        event.preventDefault();
        return;
      }
      return originalOnUnhandledRejection?.(event);
    };

    // Check if button loads successfully
    const checkButtonLoad = setInterval(() => {
      const button = buttonRef.current?.shadowRoot?.querySelector('button');
      if (button) {
        setIsLoaded(true);
        clearInterval(checkButtonLoad);
      }
    }, 500);

    // Cleanup after 10 seconds if button hasn't loaded
    const timeout = setTimeout(() => {
      clearInterval(checkButtonLoad);
      if (!isLoaded) {
        setHasError(true);
      }
    }, 10000);

    return () => {
      window.onerror = originalOnError;
      window.onunhandledrejection = originalOnUnhandledRejection;
      clearInterval(checkButtonLoad);
      clearTimeout(timeout);
    };
  }, [isLoaded]);

  if (hasError) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body1" color="error" sx={{ mb: 2 }}>
          Unable to load payment button. Please try:
        </Typography>
        <Box component="ul" sx={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Disabling ad blockers for this site</li>
          <li>Refreshing the page</li>
          <li>Using a different browser</li>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Refresh Page
        </Button>
      </Box>
    );
  }

  return (
    <>
      <stripe-buy-button
        ref={buttonRef}
        buy-button-id="buy_btn_1QUgqHFL7C10dNyGlq3U4URR"
        publishable-key="pk_live_51J7Ti4FL7C10dNyGubXiYMWwF6jPahwvwDjXXooFE9VbI1Brh6igKsmNKAqmFoYflQveSCQ8WR1N47kowzJ1drrQ00ijl4Euus"
        success-url="https://www.caldump.com/success"
        cancel-url="https://www.caldump.com"
        customer-email={email}
        client-reference-id={email}
        customer-creation="always"
        customer-update={{
          address: 'never',
          name: 'never'
        }}
      />
      {!isLoaded && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const { user, login, logout, hasPurchased, verifyPurchaseStatus } = useAuth();

  useEffect(() => {
    const checkPurchase = async () => {
      if (user) {
        try {
          await verifyPurchaseStatus(user);
        } catch (error) {
          console.error('Failed to verify purchase status:', error);
        }
      }
    };

    checkPurchase();
  }, [user, verifyPurchaseStatus]);

  const handleGoogleSignIn = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <StyledHeader>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo to="/">caldump.com</Logo>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={user.photoURL}
                alt={user.displayName}
                sx={{ width: 40, height: 40 }}
              />
              <Button
                onClick={handleSignOut}
                variant="outlined"
                color="primary"
                sx={{
                  borderRadius: '20px',
                  '&:hover': {
                    borderColor: 'primary.light',
                  }
                }}
              >
                Sign Out
              </Button>
            </Box>
          )}
        </Container>
      </StyledHeader>

      <HeroSection>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography variant="h1" gutterBottom>
              Bulk Schedule Your Calendar Events in Seconds
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
              Stop wasting time adding events one by one. Simply paste your tasks,
              set your preferences, and watch as they're automatically scheduled.
            </Typography>

            {!user && (
              <Button
                onClick={handleGoogleSignIn}
                variant="contained"
                size="large"
                sx={{
                  mb: 4,
                  py: 2,
                  px: 4,
                  fontSize: '1.2rem',
                  backgroundColor: 'white',
                  color: 'black',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  }
                }}
              >
                Continue with Google
              </Button>
            )}

            {user && !hasPurchased && (
              <BuyButtonContainer>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Note: Please use the same email ({user.email}) for purchase to activate your license.
                </Typography>
                <StripeBuyButton email={user.email} />
              </BuyButtonContainer>
            )}

            {user && hasPurchased && (
              <Button
                variant="contained"
                onClick={() => navigate('/app')}
                size="large"
                sx={{
                  py: 2.5,
                  px: 8,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -3,
                    left: -3,
                    right: -3,
                    bottom: -3,
                    background: 'linear-gradient(45deg, #ff69b4, #ff9ed2)',
                    borderRadius: '25px',
                    zIndex: -1,
                    animation: 'borderAnimation 4s linear infinite',
                  },
                  '@keyframes borderAnimation': {
                    '0%': {
                      filter: 'hue-rotate(0deg)',
                    },
                    '100%': {
                      filter: 'hue-rotate(360deg)',
                    }
                  }
                }}
              >
                Open Calendar Dashboard
              </Button>
            )}

            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }}
              gap={4}
              sx={{ mt: 8 }}
            >
              <FeatureCard>
                <FeatureIcon className="fas fa-bolt" />
                <Typography variant="h6" gutterBottom>Lightning Fast</Typography>
                <Typography variant="body2">Schedule dozens of events in seconds</Typography>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon className="fas fa-magic" />
                <Typography variant="h6" gutterBottom>Smart Scheduling</Typography>
                <Typography variant="body2">Automatically finds the best time slots</Typography>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon className="fas fa-calendar-check" />
                <Typography variant="h6" gutterBottom>Google Calendar Integration</Typography>
                <Typography variant="body2">Works with your existing calendar</Typography>
              </FeatureCard>
            </Box>
          </Box>
        </Container>
      </HeroSection>

      <Box component="footer" py={4} sx={{ textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            © 2024 caldump.com. All rights reserved.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Link
              to="/privacy"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                marginRight: '1rem',
                opacity: 0.7,
                '&:hover': { opacity: 1 }
              }}
            >
              Privacy Policy
            </Link>
            <a
              href="https://anchormarianas.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                opacity: 0.7,
                '&:hover': { opacity: 1 }
              }}
            >
              anchormarianas.com
            </a>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Landing;