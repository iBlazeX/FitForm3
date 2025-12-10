# Expo Setup Guide

This guide will help you set up and run the FitForm mobile app using Expo after migrating from bare React Native.

## Prerequisites

- Node.js >= 16
- npm or yarn
- A smartphone with Expo Go app installed:
  - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- Firebase project configured (see FIREBASE_MIGRATION.md)

## Installation

### 1. Install Dependencies

```bash
cd mobile-app
npm install
```

### 2. Install Expo CLI (Optional but Recommended)

```bash
npm install -g expo-cli
```

## Configuration

### 1. Firebase Configuration

Edit `src/config/firebase.js` with your Firebase project credentials:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const CV_SERVICE_URL = 'http://YOUR_SERVER_IP:5000/api';
```

**Important**: Replace `YOUR_SERVER_IP` with your actual server IP address or domain. `localhost` won't work on physical devices.

### 2. App Assets (Optional)

Create app icons and splash screen in the `assets/` directory:
- `icon.png` - 1024x1024px
- `splash.png` - 2048x2048px
- `adaptive-icon.png` - 1024x1024px
- `favicon.png` - 48x48px

Or use placeholders for development.

## Running the App

### Start Development Server

```bash
npm start
```

This will start Metro bundler in offline mode (to avoid network fetch errors) and open Expo DevTools in your browser.

**Note**: The app is configured to run in offline mode by default to prevent "TypeError: fetch failed" errors when Expo tries to validate dependencies online. If you have internet access and want to use online mode with dependency validation, use:

```bash
npm run start:online
```

### Run on Your Device

#### Using Expo Go App

1. Install Expo Go on your smartphone
2. Scan the QR code displayed in the terminal or browser
3. The app will load on your device

#### Using Emulator/Simulator

```bash
# Android
npm run android

# iOS (Mac only)
npm run ios

# Web
npm run web
```

## Development Workflow

### Making Changes

1. Edit files in `src/` directory
2. Save the file
3. The app will automatically reload (Fast Refresh)

### Viewing Logs

- **Terminal**: Shows console.log output and errors
- **Device**: Shake device or press Cmd+D (iOS) / Cmd+M (Android) for dev menu
- **Browser DevTools**: Open Expo DevTools in browser for additional debugging

### Debugging

#### Using React Native Debugger

1. Shake device to open dev menu
2. Tap "Debug"
3. Opens Chrome DevTools for debugging

#### Common Debugging Commands

```bash
# Clear Metro bundler cache
npm start -- --clear

# Reset Expo cache
expo start -c

# Check for issues
expo doctor
```

## Features Overview

### Implemented Features

- **Login/Register**: User authentication with Firebase
- **Dashboard**: View workout statistics
- **Workout Screen**: Placeholder for camera-based workouts
- **History**: View and manage workout history
- **Profile Management**: Update user profile information

### Planned Features

- Camera integration for real-time exercise detection
- Offline support
- Push notifications
- Social features
- Workout challenges

## Testing on Different Platforms

### Android Testing

```bash
npm run android
```

Requirements:
- Android Studio installed
- Android emulator running
- Or physical Android device connected via USB

### iOS Testing (Mac only)

```bash
npm run ios
```

Requirements:
- Xcode installed
- iOS Simulator running
- Or physical iOS device connected

### Web Testing

```bash
npm run web
```

Opens the app in your default browser. Good for quick UI testing.

## Building for Production

### Using Expo Application Services (EAS)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure build:
```bash
eas build:configure
```

4. Build for Android:
```bash
eas build --platform android
```

5. Build for iOS:
```bash
eas build --platform ios
```

### Standalone Builds

For more control, you can create standalone builds:

```bash
# Android APK
expo build:android

# iOS IPA
expo build:ios
```

## Common Issues

### Property 'require' doesn't exist (Metro Bundler)

**Problem**: Metro bundler fails with error "Property 'require' doesn't exist" when running on Expo Go

**Cause**: The `metro.config.js` file is using an incorrect import path for Expo's Metro configuration. In Expo SDK 50+, the correct package is `@expo/metro-config`, not `expo/metro-config`.

**Solution**:
Ensure your `metro.config.js` uses the correct import:
```javascript
const { getDefaultConfig } = require('@expo/metro-config');
```

If you're still seeing this error:
1. Clear Metro bundler cache: `npm start -- --clear`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Restart Metro: `npm start`

**Related**: Make sure `newArchEnabled: false` is set in `app.json` for compatibility with Expo Go.

### TypeError: fetch failed (Metro Bundler)

**Problem**: Metro bundler fails to start with a fetch error

**Cause**: Expo CLI tries to fetch native module versions from its API servers but fails (offline environment, firewall, or network issues)

**Solution**:
The project is now configured to run in offline mode by default:
- Use `npm start` (includes `--offline` flag)
- Environment variable `EXPO_OFFLINE=1` is set in `.env`
- Metro bundler configured for offline operation

If you have internet and want online mode:
```bash
npm run start:online
```

### Cannot Connect to Development Server

**Problem**: Phone can't connect to Metro bundler

**Solution**:
- Ensure phone and computer are on the same WiFi network
- Check firewall settings
- Try tunnel mode: `npm start -- --tunnel`

### Module Not Found

**Problem**: Error about missing module

**Solution**:
```bash
rm -rf node_modules
npm install
npm start -- --clear
```

### Firebase Configuration Error

**Problem**: Firebase initialization fails

**Solution**:
- Verify Firebase config in `src/config/firebase.js`
- Check Firebase project settings
- Ensure Authentication and Firestore are enabled

### Camera Permissions

**Problem**: App doesn't request camera permissions

**Solution**:
- Check `app.json` has correct permissions
- Rebuild app: `expo start --clear`
- Grant permissions in device settings

### Network Request Failed

**Problem**: API calls fail

**Solution**:
- Update `CV_SERVICE_URL` with correct server address
- Use IP address instead of localhost for physical devices
- Ensure backend server is accessible from your device

## Expo vs Bare React Native

### Benefits of Expo

✅ Easier setup and configuration  
✅ No need for Xcode or Android Studio for development  
✅ Over-the-air updates  
✅ Simplified build process  
✅ Rich set of pre-built APIs  

### Limitations

❌ Larger app size  
❌ Limited native module support  
❌ Can't use all React Native libraries  

### Ejecting from Expo

If you need more control, you can eject to bare React Native:

```bash
expo eject
```

**Warning**: This is a one-way operation and cannot be undone.

## Performance Optimization

### Tips for Better Performance

1. **Use PureComponent or React.memo** for list items
2. **Optimize images**: Use proper dimensions, compress images
3. **Lazy load** screens and components
4. **Minimize re-renders**: Use useCallback and useMemo
5. **Enable Hermes** (automatically enabled in newer Expo versions)

### Profiling

```bash
# Profile app performance
npm start -- --profile
```

## Useful Commands

```bash
# Start with cleared cache
npm start -- --clear

# Start in tunnel mode (for debugging network issues)
npm start -- --tunnel

# Start in LAN mode
npm start -- --lan

# Check Expo and project configuration
expo doctor

# Update Expo SDK
expo upgrade

# Install specific Expo package
expo install package-name
```

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Firebase for React Native](https://firebase.google.com/docs/web/setup)
- [Expo Forums](https://forums.expo.dev/)
- [Expo Discord](https://discord.gg/expo)

## Next Steps

1. ✅ Configure Firebase
2. ✅ Test login/register functionality
3. ✅ Create workout and view history
4. 🔄 Implement camera integration
5. 🔄 Add workout detection logic
6. 🔄 Implement offline support
7. 🔄 Add push notifications
8. 🔄 Build for production

## Troubleshooting

### App won't load on device

1. Check Metro bundler is running
2. Verify QR code is scanned correctly
3. Ensure device and computer on same network
4. Try tunnel mode: `npm start -- --tunnel`

### Changes not reflecting

1. Shake device for dev menu
2. Tap "Reload"
3. Or restart Metro: `npm start -- --clear`

### Build errors

1. Clear caches: `npm start -- --clear`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check Expo compatibility: `expo doctor`

## Support

For issues or questions:
1. Check Expo documentation
2. Search Expo forums
3. Open GitHub issue
4. Join Expo Discord for community help
