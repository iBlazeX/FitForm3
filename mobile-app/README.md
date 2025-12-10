# FitForm Mobile App

React Native mobile application built with Expo for iOS, Android, and Web.

## Prerequisites

- Node.js >= 16
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (install globally: `npm install -g expo-cli`)
- For iOS development: macOS with Xcode
- For Android development: Android Studio
- For testing on physical devices: [Expo Go app](https://expo.dev/client)

## Setup

### 1. Install Dependencies

```bash
cd mobile-app
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `mobile-app` directory based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```bash
# API Configuration
API_URL=http://YOUR_IP_ADDRESS:3000/api
CV_SERVICE_URL=http://YOUR_IP_ADDRESS:5000/api

# Firebase Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

**Important Notes:**

- **For Physical Devices**: Replace `localhost` with your computer's local IP address (e.g., `192.168.1.100`)
  - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- **For Android Emulator**: Use `http://10.0.2.2:3000/api` instead of localhost
- **For iOS Simulator**: Use `http://localhost:3000/api` (localhost works fine)

### 3. Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click on Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Select or create a Web app
6. Copy the `firebaseConfig` values to your `.env` file

### 4. Ensure Backend and CV Service are Running

Make sure your backend API and CV service are running and accessible:

```bash
# In the backend directory
cd backend
npm start

# In the cv-service directory
cd cv-service
python src/app.py
```

## Running the App

### Development Mode

Start the Expo development server:

```bash
npm start
```

This will open Expo Dev Tools in your browser. From here you can:

- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator
- Scan the QR code with Expo Go app on your physical device

### Platform-Specific Commands

```bash
# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## Testing on Physical Devices

### Option 1: Expo Go App (Recommended for Development)

1. Install [Expo Go](https://expo.dev/client) on your iOS or Android device
2. Make sure your device is on the same WiFi network as your development machine
3. Run `npm start`
4. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

### Option 2: Build Standalone App

For production builds:

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Project Structure

```
mobile-app/
├── App.js                  # Main app entry point
├── app.json                # Expo configuration (static)
├── app.config.js           # Expo configuration (dynamic with env vars)
├── assets/                 # Images, fonts, and other assets
├── src/
│   ├── config/
│   │   └── firebase.js     # Firebase configuration
│   ├── screens/            # Screen components
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── WorkoutScreen.js
│   │   ├── HistoryScreen.js
│   │   └── ProfileScreen.js
│   └── services/
│       └── api.js          # API service layer
└── package.json
```

## Troubleshooting

### "Network request failed" errors

- **Physical Device**: Make sure you're using your computer's local IP address, not `localhost`
- **Firewall**: Check if your firewall is blocking connections to ports 3000 and 5000
- **Same Network**: Ensure your device and development machine are on the same WiFi network

### Firebase authentication issues

- Verify all Firebase configuration values in `.env` are correct
- Make sure Email/Password authentication is enabled in Firebase Console
- Check Firebase project settings for authorized domains

### Camera permissions

- Grant camera permissions when prompted
- On iOS: Settings > Privacy > Camera > FitForm
- On Android: Settings > Apps > FitForm > Permissions > Camera

### App won't load after changes

```bash
# Clear Metro bundler cache
npm start -- --clear

# Or
expo start -c
```

### Missing dependencies

```bash
# Reinstall node_modules
rm -rf node_modules
npm install
```

## Features

- **Authentication**: Firebase-based login and registration
- **Dashboard**: View workout statistics and recent activities
- **Workout Tracking**: Manual rep counting (camera detection coming soon)
- **History**: View and manage past workouts
- **Profile Management**: Update user information and preferences

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `API_URL` | Backend API endpoint | `http://192.168.1.100:3000/api` |
| `CV_SERVICE_URL` | Computer vision service endpoint | `http://192.168.1.100:5000/api` |
| `FIREBASE_API_KEY` | Firebase API key | From Firebase Console |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `your-project.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `your-project-id` |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `your-project.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | From Firebase Console |
| `FIREBASE_APP_ID` | Firebase app ID | From Firebase Console |

## Building for Production

### Using EAS Build (Recommended)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure EAS:
```bash
eas build:configure
```

4. Build:
```bash
# For Android
eas build --platform android --profile production

# For iOS
eas build --platform ios --profile production
```

### Environment Variables in Production

For production builds, set environment variables in `eas.json` or use Expo's environment variable system:

```json
{
  "build": {
    "production": {
      "env": {
        "API_URL": "https://your-production-api.com/api",
        "CV_SERVICE_URL": "https://your-production-cv.com/api"
      }
    }
  }
}
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test on both iOS and Android if possible
4. Submit a pull request

## Support

For issues and questions:
- Check the main [README.md](../README.md) in the project root
- Review Expo documentation: https://docs.expo.dev/
- Check Firebase documentation: https://firebase.google.com/docs

## License

MIT
