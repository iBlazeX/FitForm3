/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { getAuth, getFirestore } = require('../config/firebase');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user (creates Firebase Auth user and Firestore profile)
 */
router.post('/register', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
], async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, username } = req.body;

  try {
    const firebaseAuth = getAuth();
    const db = getFirestore();

    // Create Firebase Auth user
    const userRecord = await firebaseAuth.createUser({
      email,
      password,
      displayName: username
    });

    // Create user profile in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      username,
      email,
      profile: {
        age: null,
        weight: null,
        height: null,
        gender: null,
        fitnessGoal: null
      },
      createdAt: new Date().toISOString()
    });

    // Generate custom token for immediate login
    const customToken = await firebaseAuth.createCustomToken(userRecord.uid);

    res.status(201).json({
      message: 'User registered successfully',
      uid: userRecord.uid,
      customToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ error: 'Password is too weak' });
    }
    
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Note: For Firebase, login is handled client-side. 
 * This endpoint validates the token and returns user info.
 */
router.post('/login', async (req, res) => {
  res.status(400).json({
    error: 'Login should be handled client-side with Firebase SDK',
    message: 'Use Firebase signInWithEmailAndPassword on the client, then send the ID token to authenticated endpoints'
  });
});

/**
 * GET /api/auth/profile
 * Get current user's profile (creates default profile if doesn't exist)
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create default profile for users who signed up via Firebase Auth client-side
      const defaultProfile = {
        email: req.user.email,
        username: req.user.email?.split('@')[0] || 'User',
        profile: {
          age: null,
          weight: null,
          height: null,
          gender: null,
          fitnessGoal: '',
          dailyCalorieGoal: 500,
          dailyRepsGoal: 100,
          weeklyWorkoutGoal: 5
        },
        createdAt: new Date()
      };
      await userRef.set(defaultProfile);
      
      return res.json({
        uid: req.user.uid,
        ...defaultProfile
      });
    }

    const userData = userDoc.data();
    res.json({
      uid: req.user.uid,
      email: req.user.email,
      ...userData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * PUT /api/auth/profile
 * Update current user's profile (creates if doesn't exist)
 */
router.put('/profile', auth, [
  body('profile.age').optional({ nullable: true }).isInt({ min: 1, max: 150 }),
  body('profile.weight').optional({ nullable: true }).isFloat({ min: 1 }),
  body('profile.height').optional({ nullable: true }).isFloat({ min: 1 }),
  body('profile.gender').optional({ nullable: true }).isIn(['male', 'female', 'other', null]),
  body('profile.fitnessGoal').optional({ nullable: true }),
  body('profile.dailyCalorieGoal').optional({ nullable: true }).isInt({ min: 0 }),
  body('profile.dailyRepsGoal').optional({ nullable: true }).isInt({ min: 0 }),
  body('profile.weeklyWorkoutGoal').optional({ nullable: true }).isInt({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = getFirestore();
    const { username, profile } = req.body;

    const updateData = {
      updatedAt: new Date()
    };
    if (username) updateData.username = username;
    if (profile) updateData.profile = profile;

    // Use set with merge to create document if it doesn't exist
    await db.collection('users').doc(req.user.uid).set(updateData, { merge: true });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * POST /api/auth/verify-token
 * Verify a Firebase ID token and return user info
 */
router.post('/verify-token', auth, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

module.exports = router;
