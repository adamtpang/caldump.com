import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from '../firebase-config';
import axiosInstance from '../axios-config';

const AuthContext = createContext();

const checkPurchaseStatus = async (email) => {
  try {
    const response = await axiosInstance.get('/api/purchases/check-purchase', {
      params: { email }
    });
    return response.data?.hasPurchased || false;
  } catch (error) {
    console.error('Purchase check failed:', error.message);
    return false;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);

  const verifyPurchaseStatus = async (user) => {
    if (!user?.email) return false;
    const purchased = await checkPurchaseStatus(user.email);
    setHasPurchased(purchased);
    return purchased;
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const token = await user.getIdToken(true);
        localStorage.setItem('caldump_token', token);
        await verifyPurchaseStatus(user);
      } else {
        localStorage.removeItem('caldump_token');
        setHasPurchased(false);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      localStorage.removeItem('caldump_token');
    };
  }, []);

  const login = async () => {
    const result = await signInWithPopup(auth, provider);
    await verifyPurchaseStatus(result.user);
    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('caldump_token');
    setHasPurchased(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      hasPurchased,
      verifyPurchaseStatus
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}