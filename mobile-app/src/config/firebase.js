/**
 * Firebase Configuration for Mobile App
 */

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCqJH8RVm1nj4ELrOK7IQbWEiUl4RCAv3o",
  authDomain: "fitform-125a7.firebaseapp.com",
  projectId: "fitform-125a7",
  storageBucket: "fitform-125a7.firebasestorage.app",
  messagingSenderId: "151095291582",
  appId: "1:151095291582:web:0a7805981699ae926738ef"
};

// CV Service URL - Use your computer's local IP
// Note: localhost won't work on physical devices
export const CV_SERVICE_URL = 'http://172.16.45.140:5000/api';

// Backend API URL
export const API_URL = 'http://172.16.45.140:3000/api';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;
