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

const checkPurchaseStatus = async (email, retryCount = 0) => {
  try {
    console.log(`Attempt ${retryCount + 1}: Checking purchase status for ${email}`);
    const response = await axiosInstance.get('/api/purchases/check-purchase', {
      params: { email }
    });
    console.log('Purchase status response:', response.data);
    return response.data.hasPurchased;
  } catch (error) {
    console.error(`Attempt ${retryCount + 1} failed:`, error);
    if (retryCount < 2) { // Try up to 3 times
      console.log('Retrying in 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return checkPurchaseStatus(email, retryCount + 1);
    }
    throw error;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          const purchased = await checkPurchaseStatus(user.email);
          setHasPurchased(purchased);
          setError(null);
        } catch (error) {
          console.error('Error checking purchase status:', error);
          setHasPurchased(false);
          setError('Failed to verify purchase status. Please try refreshing the page.');
        }
      } else {
        setHasPurchased(false);
        setError(null);
      }
      setLoading(false);
    });

    return unsubscribe;
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

  const logout = () => {
    setHasPurchased(false);
    setError(null);
    return signOut(auth);
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