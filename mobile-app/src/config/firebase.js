/**
 * Firebase Configuration for Mobile App
 */

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get configuration from app.config.js (via expo-constants)
const extra = Constants.expoConfig?.extra;

if (!extra) {
  console.warn(
    'Warning: Expo configuration not found. Make sure app.config.js is properly configured and environment variables are set.'
  );
}

// Firebase configuration from environment variables
export const firebaseConfig = {
  apiKey: extra?.firebaseConfig?.apiKey || '',
  authDomain: extra?.firebaseConfig?.authDomain || '',
  projectId: extra?.firebaseConfig?.projectId || '',
  storageBucket: extra?.firebaseConfig?.storageBucket || '',
  messagingSenderId: extra?.firebaseConfig?.messagingSenderId || '',
  appId: extra?.firebaseConfig?.appId || ''
};

// Validate Firebase configuration in development
if (__DEV__) {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missingKeys.length > 0) {
    console.warn(
      `Warning: Missing Firebase configuration keys: ${missingKeys.join(', ')}. ` +
      'Please check your .env file and ensure all FIREBASE_* variables are set. ' +
      'See mobile-app/README.md for setup instructions.'
    );
  }
}

// API URLs from environment variables
// Note: For physical devices, use your computer's local IP instead of localhost
// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, localhost works fine
export const CV_SERVICE_URL = extra?.cvServiceUrl || 'http://localhost:5000/api';
export const API_URL = extra?.apiUrl || 'http://localhost:3000/api';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;
