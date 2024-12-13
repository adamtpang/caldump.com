import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, CircularProgress, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSearchParams } from 'react-router-dom';

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

const Status = styled(Typography)(({ theme, error }) => ({
  fontWeight: 600,
  color: error ? theme.palette.error.main : theme.palette.primary.main,
  marginTop: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
}));

// Extension IDs
const EXTENSION_IDS = {
  development: 'hpjjkpbpnmnpfncfbondglbefadklfken',
  production: 'ociinpogekbfnofjgobkjcpbpldlfken'
};

const Success = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState({ message: 'Activating your license...', error: false });
  const sessionId = searchParams.get('session_id');

  const tryConnectToExtension = async (extensionId, sessionId) => {
    return new Promise((resolve) => {
      try {
        console.log(`Attempting to connect to extension: ${extensionId}`);
        const port = chrome.runtime.connect(extensionId, { name: 'license_activation' });

        // Set up timeout
        const timeout = setTimeout(() => {
          console.log(`Connection timeout for ${extensionId}`);
          port.disconnect();
          resolve({ success: false });
        }, 5000);

        // Listen for responses
        port.onMessage.addListener((response) => {
          clearTimeout(timeout);
          if (response.status === 'success') {
            console.log(`Successfully activated license with ${extensionId}`);
            resolve({ success: true, extensionId });
          } else {
            console.log(`Failed to activate license with ${extensionId}`);
            resolve({ success: false });
          }
          port.disconnect();
        });

        // Handle disconnection
        port.onDisconnect.addListener(() => {
          if (chrome.runtime.lastError) {
            console.log(`Connection failed for ${extensionId}:`, chrome.runtime.lastError);
          }
          clearTimeout(timeout);
          resolve({ success: false });
        });

        // Send activation message
        port.postMessage({
          type: 'activate_license',
          sessionId: sessionId,
          timestamp: Date.now()
        });

      } catch (error) {
        console.error(`Error connecting to ${extensionId}:`, error);
        resolve({ success: false });
      }
    });
  };

  useEffect(() => {
    const activateLicense = async () => {
      if (!sessionId) {
        setStatus({ message: 'No session ID found', error: true });
        return;
      }

      try {
        // Try development extension first
        console.log('Trying development extension...');
        let result = await tryConnectToExtension(EXTENSION_IDS.development, sessionId);

        // If dev fails, try production
        if (!result.success) {
          console.log('Development failed, trying production...');
          result = await tryConnectToExtension(EXTENSION_IDS.production, sessionId);
        }

        if (result.success) {
          console.log('Activation successful with:', result.extensionId);
          setStatus({ message: 'License activated successfully!', error: false });
          // After 2 seconds, redirect back to the extension
          setTimeout(() => {
            window.location.href = `chrome-extension://${result.extensionId}/popup.html`;
          }, 2000);
        } else {
          console.log('Both extensions failed to activate');
          setStatus({
            message: 'Failed to activate license. Please ensure the extension is installed and try reopening it.',
            error: true
          });
        }
      } catch (error) {
        console.error('Error:', error);
        setStatus({
          message: 'Failed to communicate with extension. Please ensure the extension is installed.',
          error: true
        });
      }
    };

    activateLicense();
  }, [sessionId]);

  return (
    <SuccessContainer>
      <ContentBox>
        <SuccessIcon className="fas fa-calendar-check" />
        <Typography variant="h4" gutterBottom>
          Thank you for your purchase!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
          You're now getting access to caldump.com's powerful calendar scheduling features.
        </Typography>
        <Status error={status.error}>
          {status.message}
          {!status.error && status.message.includes('Activating') && (
            <CircularProgress size={20} color="inherit" />
          )}
        </Status>
      </ContentBox>
    </SuccessContainer>
  );
};

export default Success;