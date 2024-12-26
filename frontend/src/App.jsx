import React from 'react';
import { ThemeProvider } from '@mui/material';
import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/app/Dashboard';
import Landing from './pages/static/Landing';
import Pricing from './pages/static/Pricing';

function AppContent() {
  const { user, hasLicense } = useAuth();

  if (!user) {
    return <Landing />;
  }

  if (!hasLicense) {
    return <Pricing />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
