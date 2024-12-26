import React from 'react';
import { ThemeProvider } from '@mui/material';
import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/app/Dashboard';
import Landing from './pages/static/Landing';

function AppContent() {
  const { user } = useAuth();

  return user ? <Dashboard /> : <Landing />;
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
