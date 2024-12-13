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

    // Get the user's Firebase profile to ensure we have complete data
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    // Find or create user with correct googleId (Firebase UID)
    let user = await User.findOne({ googleId: decodedToken.uid });

    if (!user) {
      // Create new user with Firebase UID as googleId
      user = await User.create({
        email: userRecord.email,
        googleId: decodedToken.uid, // Using Firebase UID, not email
        displayName: userRecord.displayName || userRecord.email,
        photoURL: userRecord.photoURL,
        settings: {
          startTime: '09:00',
          endTime: '17:00'
        }
      });
    } else {
      // Update existing user's information if needed
      user.email = userRecord.email;
      user.displayName = userRecord.displayName || userRecord.email;
      user.photoURL = userRecord.photoURL;
      await user.save();
    }

    // Log successful authentication
    console.log('User authenticated:', {
      email: user.email,
      googleId: user.googleId,
      hasLicense: user.license?.isActive
    });

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
    res.status(401).json({
      error: 'Invalid token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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