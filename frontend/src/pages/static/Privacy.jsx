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

const ContentContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
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

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  padding: theme.spacing(12, 0, 6),
}));

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const StyledLink = styled('a')(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'none',
  '&:hover': {
    color: theme.palette.primary.light,
    textDecoration: 'underline',
  },
}));

const Privacy = () => {
  return (
    <>
      <StyledHeader>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo to="/">caldump.com</Logo>
        </Container>
      </StyledHeader>

      <ContentContainer>
        <ContentWrapper>
          <Container maxWidth="md">
            <Section>
              <Typography variant="h2" color="primary" gutterBottom>
                Privacy Policy
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.7, mb: 4 }}>
                Last updated: February 2024
              </Typography>
            </Section>

            <Section>
              <Typography variant="h4" gutterBottom>
                Introduction
              </Typography>
              <Typography variant="body1" paragraph>
                This Privacy Policy describes how caldump.com ("we", "our", or "us") collects, uses, and protects your information when you use our service.
              </Typography>
            </Section>

            <Section>
              <Typography variant="h4" gutterBottom>
                Information We Collect
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <Typography component="li" variant="body1" paragraph>
                  <strong>Google Calendar Access:</strong> Our service requires access to your Google Calendar to schedule events. We only access this when you explicitly use the app to add events.
                </Typography>
                <Typography component="li" variant="body1" paragraph>
                  <strong>Usage Data:</strong> We may collect anonymous usage statistics to improve functionality.
                </Typography>
              </Box>
            </Section>

            <Section>
              <Typography variant="h4" gutterBottom>
                Data Storage
              </Typography>
              <Typography variant="body1" paragraph>
                We do not store your calendar data or personal information on our servers. All calendar operations are performed directly with Google's servers.
              </Typography>
            </Section>

            <Section>
              <Typography variant="h4" gutterBottom>
                Google API Services
              </Typography>
              <Typography variant="body1" paragraph>
                Our service uses Google Calendar API. By using our service, you are also agreeing to:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <Typography component="li" variant="body1" paragraph>
                  <StyledLink href="https://policies.google.com/privacy" target="_blank">
                    Google's Privacy Policy
                  </StyledLink>
                </Typography>
                <Typography component="li" variant="body1" paragraph>
                  Google Calendar API Terms of Service
                </Typography>
              </Box>
            </Section>

            <Section>
              <Typography variant="h4" gutterBottom>
                Contact Us
              </Typography>
              <Typography variant="body1" paragraph>
                If you have questions about this Privacy Policy, please contact us at:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <Typography component="li" variant="body1">
                  Website: <StyledLink href="https://caldump.com">caldump.com</StyledLink>
                </Typography>
              </Box>
            </Section>
          </Container>
        </ContentWrapper>

        <Box component="footer" py={4} sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Container maxWidth="lg">
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © 2024 caldump.com. All rights reserved.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <StyledLink
                href="https://anchormarianas.com"
                target="_blank"
                sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
              >
                anchormarianas.com
              </StyledLink>
            </Box>
          </Container>
        </Box>
      </ContentContainer>
    </>
  );
};

export default Privacy;