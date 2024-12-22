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
  const successUrl = encodeURIComponent(`${window.location.origin}/success?email=${encodeURIComponent(email)}`);

  return (
    <Button
      variant="contained"
      size="large"
      href={`https://buy.stripe.com/eVa4j3dDd7AC18c9AD?prefilled_email=${encodeURIComponent(email)}&success_url=${successUrl}&client_reference_id=${encodeURIComponent(email)}`}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        py: 2,
        px: 6,
        fontSize: '1.2rem',
        backgroundColor: '#635bff',
        color: 'white',
        '&:hover': {
          backgroundColor: '#4b45c6',
        }
      }}
    >
      Purchase License
    </Button>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await login();
      navigate('/dashboard'); // Direct to dashboard after sign in
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
          {user ? (
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
          ) : (
            <Button
              onClick={handleGoogleSignIn}
              variant="contained"
              color="primary"
              sx={{
                borderRadius: '20px',
                px: 4,
              }}
            >
              Sign In with Google
            </Button>
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
                  py: 2,
                  px: 6,
                  fontSize: '1.2rem',
                }}
              >
                Get Started
              </Button>
            )}
          </Box>
        </Container>
      </HeroSection>
    </>
  );
};

export default Landing;