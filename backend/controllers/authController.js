const admin = require('firebase-admin');
const User = require('../models/User');

// Function to format private key correctly
const formatPrivateKey = (key) => {
  if (!key || typeof key !== 'string') {
    throw new Error('Private key is required and must be a string');
  }
  // Remove any extra quotes and spaces
  key = key.trim();
  if (key.startsWith('"')) key = key.slice(1);
  if (key.endsWith('"')) key = key.slice(0, -1);
  // Ensure proper line breaks
  return key.replace(/\\n/g, '\n');
};

try {
  // Initialize Firebase Admin with service account
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  });
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Find or create user
    let user = await User.findOne({ googleId: decodedToken.uid });

    if (!user) {
      // Get the user's Firebase profile
      const userRecord = await admin.auth().getUser(decodedToken.uid);

      // Create new user
      user = await User.create({
        email: userRecord.email,
        googleId: userRecord.uid,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
      });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        license: user.license,
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        license: user.license,
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};