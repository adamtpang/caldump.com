import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-6B1cTtQcRLLmEpN-qtx9kj3ufZBDWNU",
  authDomain: "caldump-21283.firebaseapp.com",
  projectId: "caldump-21283",
  storageBucket: "caldump-21283.appspot.com",
  messagingSenderId: "560852095560",
  appId: "1:560852095560:web:a8c7f8209a956748377e7d",
  measurementId: "G-TCE83HDV6L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
export const analytics = getAnalytics(app);

// Initialize Auth
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Configure Google Auth Provider
provider.setCustomParameters({
  prompt: 'select_account'
});