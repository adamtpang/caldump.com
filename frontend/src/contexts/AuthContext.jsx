import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from '../firebase-config';
import axiosInstance, { API_URL } from '../axios-config';

const AuthContext = createContext();

const checkPurchaseStatus = async (email) => {
  try {
    console.log('Checking purchase status for:', email);
    console.log('Using API URL:', API_URL);

    // Add retry logic for production
    const maxRetries = 3;
    let retries = 0;
    let lastError;

    while (retries < maxRetries) {
      try {
        const response = await axiosInstance.get('/api/purchases/check-purchase', {
          params: { email },
          timeout: 5000, // 5 second timeout
          baseURL: API_URL // Ensure we're using the correct API URL
        });

        if (response.data && typeof response.data.hasPurchased === 'boolean') {
          console.log('Purchase status response:', response.data);
          return response.data.hasPurchased;
        } else {
          console.error('Invalid purchase status response:', response.data);
          throw new Error('Invalid purchase status response');
        }
      } catch (error) {
        lastError = error;
        retries++;
        console.error(`Purchase status check attempt ${retries} failed:`, {
          error: error.message,
          config: error.config,
          response: error.response?.data
        });

        if (retries < maxRetries) {
          console.log(`Retry ${retries}/${maxRetries} for purchase status check`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }

    console.error('Final error checking purchase status:', {
      error: lastError.message,
      email,
      config: lastError.config,
      response: lastError.response?.data
    });
    return false;
  } catch (error) {
    console.error('Error in purchase status check wrapper:', {
      error: error.message,
      stack: error.stack
    });
    return false;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [error, setError] = useState(null);

  const verifyPurchaseStatus = async (user) => {
    if (!user?.email) {
      console.error('No user email provided for purchase verification');
      setHasPurchased(false);
      setError('User email not available');
      return false;
    }

    try {
      console.log('Starting purchase verification for:', user.email);
      const purchased = await checkPurchaseStatus(user.email);
      console.log('Purchase verification result:', {
        email: user.email,
        hasPurchased: purchased
      });
      setHasPurchased(purchased);
      setError(null);
      return purchased;
    } catch (error) {
      console.error('Purchase verification error:', {
        error: error.message,
        email: user.email,
        stack: error.stack
      });
      setHasPurchased(false);
      setError('Failed to verify purchase status');
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user?.email);
      setUser(user);

      if (user) {
        try {
          console.log('Getting fresh token for:', user.email);
          const token = await user.getIdToken(true);
          localStorage.setItem('caldump_token', token);
          await verifyPurchaseStatus(user);
        } catch (error) {
          console.error('Auth state change error:', {
            error: error.message,
            email: user.email,
            stack: error.stack
          });
          setHasPurchased(false);
          setError('Failed to verify purchase status');
        }
      } else {
        localStorage.removeItem('caldump_token');
        setHasPurchased(false);
        setError(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      localStorage.removeItem('caldump_token');
    };
  }, []);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Sign in successful:', result.user.email);
      await verifyPurchaseStatus(result.user);
      return result.user;
    } catch (error) {
      console.error('Login error:', {
        error: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('caldump_token');
      setHasPurchased(false);
      setError(null);
    } catch (error) {
      console.error('Logout error:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    hasPurchased,
    error,
    verifyPurchaseStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}