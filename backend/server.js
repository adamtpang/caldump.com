const { initializeApp } = require('firebase-admin/app');
const serviceAccount = require('./serviceAccount.json');

// Initialize Firebase Admin
try {
  initializeApp({
    credential: require('firebase-admin/app').cert(serviceAccount)
  });

  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}