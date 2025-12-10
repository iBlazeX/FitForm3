/**
 * Authentication Middleware
 * Verifies Firebase ID tokens for protected routes
 */

const { getAuth } = require('../config/firebase');

const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      // Verify the Firebase ID token
      const firebaseAuth = getAuth();
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      
      // Attach user info to request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };
      
      next();
    } catch (verifyError) {
      console.error('Token verification error:', verifyError.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = auth;
