import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import axiosInstance from '../axios-config';

const AuthContext = createContext();

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const checkPurchaseStatus = async (email) => {
  try {
    const response = await axiosInstance.get('/api/purchases/check-purchase', {
      params: { email }
    });
    return response.data.hasPurchased;
  } catch (error) {
    console.error('Error checking purchase status:', error);
    return false;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [error, setError] = useState(null);

  // Clear any cached data on mount
  useEffect(() => {
    localStorage.removeItem('caldump_token');
    setHasPurchased(false);
    setError(null);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          // Get fresh ID token
          const token = await user.getIdToken(true);
          localStorage.setItem('caldump_token', token);

          const purchased = await checkPurchaseStatus(user.email);
          setHasPurchased(purchased);
          setError(null);
        } catch (error) {
          console.error('Error checking purchase status:', error);
          setHasPurchased(false);
          setError('Failed to verify purchase status. Please try refreshing the page.');
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
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
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
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    hasPurchased,
    error
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