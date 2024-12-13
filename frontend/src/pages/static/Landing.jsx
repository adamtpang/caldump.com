import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';

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

const Landing = () => {
  return (
    <>
      <StyledHeader>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo to="/">caldump.com</Logo>
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

            <BuyButtonContainer>
              <stripe-buy-button
                buy-button-id="buy_btn_1QUgqHFL7C10dNyGlq3U4URR"
                publishable-key="pk_live_51J7Ti4FL7C10dNyGubXiYMWwF6jPahwvwDjXXooFE9VbI1Brh6igKsmNKAqmFoYflQveSCQ8WR1N47kowzJ1drrQ00ijl4Euus"
              >
              </stripe-buy-button>
            </BuyButtonContainer>

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