import React from 'react';
import { ThemeProvider } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/app/Dashboard';
import Landing from './pages/static/Landing';

function ProtectedRoute({ children }) {
  const { user, hasLicense } = useAuth();

  if (!user || !hasLicense) {
    return <Navigate to="/" />;
  }

  return children;
}

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
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
