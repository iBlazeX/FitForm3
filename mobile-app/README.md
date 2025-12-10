# FitForm Mobile App

React Native mobile application for FitForm - AI-Powered Fitness Platform built with Expo.

## Features

- **User Authentication**: Secure login and registration with Firebase
- **Dashboard**: View workout statistics and progress
- **Workout Tracking**: Track exercises (Push-ups, Squats, Sit-ups)
- **History**: View and manage past workouts
- **Profile Management**: Update user profile and fitness goals

## Prerequisites

- Node.js >= 16
- npm or yarn
- Expo Go app on your smartphone:
  - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- Firebase project configured (see main README)
- Backend API and CV Service running

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update with your configuration:
   - Replace `localhost` with your computer's IP address for physical devices
   - For Android Emulator, use `10.0.2.2` instead of `localhost`
   - Add your Firebase configuration from the Firebase Console

3. **Start the development server**:
   ```bash
   npm start
   ```

## Running the App

### On Physical Device (Recommended for Development)

1. Install Expo Go on your smartphone
2. Make sure your phone and computer are on the same WiFi network
3. Run `npm start`
4. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

**Important**: Update the `.env` file with your computer's IP address instead of `localhost`:
```bash
# Find your IP address
# Mac/Linux: ifconfig | grep "inet "
# Windows: ipconfig

# Then update .env
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3000/api
EXPO_PUBLIC_CV_SERVICE_URL=http://YOUR_IP_ADDRESS:5000/api
```

### On Android Emulator

```bash
npm run android
```

**Note**: Update `.env` to use `10.0.2.2` for API URLs:
```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
```

### On iOS Simulator (Mac only)

```bash
npm run ios
```

### Web Browser

```bash
npm run web
```

## Project Structure

```
mobile-app/
├── src/
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── WorkoutScreen.js
│   │   ├── HistoryScreen.js
│   │   └── ProfileScreen.js
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.js
│   ├── contexts/         # React contexts
│   │   └── AuthContext.js
│   ├── services/         # API services
│   │   └── api.js
│   └── config/          # Configuration
│       └── firebase.js
├── assets/              # Images and assets
├── App.js              # Main app component
├── app.json            # Expo configuration
├── package.json
└── .env.example        # Environment variables template
```

## Available Scripts

- `npm start` - Start Expo development server (with offline mode enabled)
- `npm run start:online` - Start Expo development server (online mode, requires internet)
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser

## Development Tips

### Hot Reload

The app supports Fast Refresh. Changes to your code will automatically reload the app.

### Debug Menu

- iOS: Shake device or press Cmd+D
- Android: Shake device or press Cmd+M (Mac) / Ctrl+M (Windows/Linux)

### Clear Cache

If you encounter issues:
```bash
npm start -- --clear
```

### Network Issues

If your device can't connect to the development server:

1. **Try tunnel mode**:
   ```bash
   npm start -- --tunnel
   ```

2. **Check firewall settings**: Ensure your firewall allows connections on port 8081

3. **Verify same network**: Ensure device and computer are on the same WiFi

## Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > General
4. Under "Your apps", select or add a Web app
5. Copy the configuration values to your `.env` file

Required Firebase services:
- **Authentication** (Email/Password enabled)
- **Firestore Database**

## Backend Requirements

The mobile app requires these services to be running:

1. **Backend API** (Port 3000): User authentication and workout management
2. **CV Service** (Port 5000): Exercise detection (optional for basic usage)

See the main project README for backend setup instructions.

## Camera Integration

Camera-based exercise detection is planned for future releases. Currently, the workout screen shows available exercises and instructions.

To enable camera features in the future:
- Camera permissions are already configured in `app.json`
- The app will request camera access when needed

## Troubleshooting

### "TypeError: fetch failed" when starting Metro Bundler

**Problem**: Expo CLI fails to start with a fetch error when trying to validate dependencies

**Solution**:
This happens when Expo tries to fetch native module versions from its API servers but cannot reach them (e.g., in offline environments or behind restrictive firewalls).

The app is now configured to run in offline mode by default:
- The `npm start` command includes the `--offline` flag
- The `.env` file sets `EXPO_OFFLINE=1`
- Metro bundler is configured to work without internet connectivity

If you have internet access and want to use online mode:
```bash
npm run start:online
```

Or manually set in `.env`:
```bash
EXPO_OFFLINE=0
```

### "Network request failed"

**Problem**: API calls are failing

**Solutions**:
- Verify backend and CV service are running
- Check your `.env` configuration
- Use IP address instead of `localhost` for physical devices
- For Android Emulator, use `10.0.2.2` instead of `localhost`

### "Firebase: Error (auth/invalid-api-key)"

**Problem**: Firebase configuration is incorrect

**Solutions**:
- Verify Firebase configuration in `.env`
- Ensure all Firebase environment variables are set
- Check that Authentication is enabled in Firebase Console

### "Module not found"

**Problem**: Dependencies are missing

**Solution**:
```bash
rm -rf node_modules
npm install
npm start -- --clear
```

### App won't load on device

**Solutions**:
1. Ensure Metro bundler is running
2. Check that device and computer are on same network
3. Try tunnel mode: `npm start -- --tunnel`
4. Restart Expo Go app

## Building for Production

### Using Expo Application Services (EAS)

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure build**:
   ```bash
   eas build:configure
   ```

4. **Build for Android**:
   ```bash
   eas build --platform android
   ```

5. **Build for iOS**:
   ```bash
   eas build --platform ios
   ```

## Future Features

- [ ] Camera-based exercise detection
- [ ] Real-time rep counting
- [ ] Form evaluation feedback
- [ ] Offline workout support
- [ ] Push notifications
- [ ] Workout challenges
- [ ] Social features
- [ ] Apple Health / Google Fit integration

## Contributing

Please see the main project CONTRIBUTING.md for guidelines.

## License

This project is part of FitForm and is licensed under the MIT License.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the main project documentation
3. Open an issue on GitHub
4. Join the Expo Discord for Expo-specific questions

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Documentation](https://reactnative.dev/)
