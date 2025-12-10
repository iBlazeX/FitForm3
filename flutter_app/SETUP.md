# Flutter App Setup Guide

This guide will help you set up the FitForm Flutter mobile application.

## Prerequisites

- Flutter SDK 3.0.0 or higher ([Install Flutter](https://docs.flutter.dev/get-started/install))
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- A Firebase project with Authentication and Firestore enabled

## Step 1: Verify Flutter Installation

```bash
flutter doctor
```

This command checks your environment and displays a report. Fix any issues indicated by the doctor command.

## Step 2: Install Dependencies

```bash
cd flutter_app
flutter pub get
```

This downloads all the required Flutter packages specified in `pubspec.yaml`.

## Step 3: Firebase Configuration

### Option A: Using FlutterFire CLI (Recommended)

1. Install FlutterFire CLI:
   ```bash
   dart pub global activate flutterfire_cli
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Configure Firebase for your project:
   ```bash
   flutterfire configure
   ```
   
   This command will:
   - Ask you to select or create a Firebase project
   - Generate `lib/config/firebase_options.dart` with your configuration
   - Add Firebase configuration files to Android and iOS

### Option B: Manual Configuration

If you prefer manual setup or FlutterFire CLI doesn't work:

#### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication → Email/Password provider
4. Create a Firestore Database in production mode

#### 2. Configure Android

1. In Firebase Console, add an Android app
2. Package name: `com.example.fitform_flutter`
3. Download `google-services.json`
4. Place it in `android/app/` directory

#### 3. Configure iOS

1. In Firebase Console, add an iOS app
2. Bundle ID: `com.example.fitformFlutter`
3. Download `GoogleService-Info.plist`
4. Place it in `ios/Runner/` directory

#### 4. Update Firebase Options

Edit `lib/config/firebase_options.dart` and replace the placeholder values with your Firebase configuration from the Firebase Console → Project Settings.

## Step 4: Configure API URLs

Edit `lib/services/api_service.dart` and update the API URLs:

```dart
static const String baseUrl = 'http://YOUR_BACKEND_URL:3000/api';
static const String cvServiceUrl = 'http://YOUR_CV_SERVICE_URL:5000/api';
```

### Important Network Configuration:

- **Android Emulator**: Use `http://10.0.2.2:3000/api` to access localhost
- **iOS Simulator**: Use `http://localhost:3000/api` (should work) or your computer's IP
- **Physical Devices**: Use your computer's local IP address (e.g., `http://192.168.1.100:3000/api`)

To find your computer's IP address:
- **Windows**: Run `ipconfig` in Command Prompt
- **macOS/Linux**: Run `ifconfig` or `ip addr` in Terminal

## Step 5: Set Up Firestore Security Rules

In Firebase Console → Firestore Database → Rules, add these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Workouts collection
    match /workouts/{workoutId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Step 6: Run the App

### On Android

1. Start an Android emulator or connect a physical device
2. Run:
   ```bash
   flutter run
   ```

### On iOS (macOS only)

1. Start an iOS simulator or connect a physical device
2. Run:
   ```bash
   flutter run
   ```

## Step 7: Build for Release

### Android APK

```bash
flutter build apk --release
```

The APK will be located at: `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (for Play Store)

```bash
flutter build appbundle --release
```

The bundle will be located at: `build/app/outputs/bundle/release/app-release.aab`

### iOS (macOS only)

```bash
flutter build ios --release
```

Then open `ios/Runner.xcworkspace` in Xcode to archive and upload to App Store.

## Troubleshooting

### Firebase Initialization Error

**Problem**: App crashes with Firebase initialization error

**Solution**:
- Verify `google-services.json` (Android) is in `android/app/`
- Verify `GoogleService-Info.plist` (iOS) is in `ios/Runner/`
- Run `flutter clean` and `flutter pub get`
- Rebuild the app

### Network Connection Error

**Problem**: Cannot connect to backend API

**Solution**:
- Check API URLs in `lib/services/api_service.dart`
- For Android Emulator, use `10.0.2.2` instead of `localhost`
- Ensure backend and CV service are running
- Check firewall settings

### Dependency Conflicts

**Problem**: Errors during `flutter pub get`

**Solution**:
- Update Flutter: `flutter upgrade`
- Clear pub cache: `flutter pub cache repair`
- Delete `pubspec.lock` and run `flutter pub get` again

### Build Failures

**Problem**: Build fails with Gradle or Xcode errors

**Solution**:
- Run `flutter clean`
- Delete `build/` folder
- Run `flutter pub get`
- Update dependencies in `pubspec.yaml` if needed
- For Android: Update Android SDK and build tools
- For iOS: Update Xcode to the latest version

### Camera Permission Issues

**Problem**: Camera not working or permission denied

**Solution**:
- Android: Permissions are in `AndroidManifest.xml` (already added)
- iOS: Add to `ios/Runner/Info.plist`:
  ```xml
  <key>NSCameraUsageDescription</key>
  <string>We need camera access to detect exercises</string>
  ```

## Testing

Run unit tests:
```bash
flutter test
```

Run widget tests:
```bash
flutter test test/widget_test.dart
```

## Development Tips

1. **Hot Reload**: Press `r` in terminal while app is running to hot reload changes
2. **Hot Restart**: Press `R` in terminal for full restart
3. **Debug Mode**: Run `flutter run` without release flag for debug mode with DevTools
4. **Analyze Code**: Run `flutter analyze` to check for issues
5. **Format Code**: Run `flutter format .` to format Dart code

## Additional Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Firebase for Flutter](https://firebase.google.com/docs/flutter/setup)
- [FlutterFire Documentation](https://firebase.flutter.dev/)
- [Dart Language Tour](https://dart.dev/guides/language/language-tour)

## Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Run `flutter doctor` to check for environment issues
3. Check Firebase Console for authentication and Firestore issues
4. Review Flutter and FlutterFire documentation
5. Open an issue on the GitHub repository

## Next Steps

After setup:
1. Start the backend API and CV service
2. Run the Flutter app
3. Register a new account
4. Test workout tracking features
5. Review workout history and profile management

Happy coding! 🚀
