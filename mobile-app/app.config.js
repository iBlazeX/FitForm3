/**
 * Expo App Configuration
 * This file replaces app.json and allows us to use environment variables
 */

export default {
  expo: {
    name: 'FitForm',
    slug: 'fitform',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#4F46E5'
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.fitform.app',
      infoPlist: {
        NSCameraUsageDescription:
          'FitForm needs camera access to detect your exercises and count reps in real-time.'
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#4F46E5'
      },
      package: 'com.fitform.app',
      permissions: ['android.permission.CAMERA']
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      [
        'expo-camera',
        {
          cameraPermission: 'Allow FitForm to access your camera for exercise detection.'
        }
      ],
      'expo-asset'
    ],
    extra: {
      apiUrl: process.env.API_URL || 'http://localhost:3000/api',
      cvServiceUrl: process.env.CV_SERVICE_URL || 'http://localhost:5000/api',
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.FIREBASE_APP_ID || ''
      }
    }
  }
};
