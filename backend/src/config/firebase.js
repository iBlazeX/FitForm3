/**
 * Firebase Configuration and Initialization
 */

const admin = require('firebase-admin');

let firebaseApp = null;

function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Option 1: Use FIREBASE_SERVICE_ACCOUNT environment variable (JSON string)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase initialized with service account from environment');
    }
    // Option 2: Use GOOGLE_APPLICATION_CREDENTIALS (file path)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      console.log('Firebase initialized with application default credentials');
    }
    // Option 3: Try default initialization (for Cloud environments)
    else {
      firebaseApp = admin.initializeApp();
      console.log('Firebase initialized with default credentials');
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error.message);
    console.log('Firebase features will be disabled');
    return null;
  }

  return firebaseApp;
}

// Get Firestore instance
function getFirestore() {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin.firestore();
}

// Get Auth instance
function getAuth() {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin.auth();
}

module.exports = {
  initializeFirebase,
  getFirestore,
  getAuth,
  admin
};
