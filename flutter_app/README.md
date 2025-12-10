# FitForm Flutter App

A Flutter mobile application for the FitForm AI-Powered Fitness Platform.

## Features

- **Firebase Authentication**: Secure user registration and login
- **Real-time Exercise Detection**: Integration with CV service for exercise detection
- **Workout Tracking**: Track reps, duration, and calories burned
- **Workout History**: View and manage past workout sessions
- **User Profile**: Manage personal information and fitness goals
- **Cross-platform**: Works on Android and iOS

## Prerequisites

- Flutter SDK 3.0.0 or higher
- Dart SDK 3.0.0 or higher
- Android Studio / Xcode (for mobile development)
- Firebase project with Authentication and Firestore enabled

## Setup

### 1. Install Flutter

Follow the official Flutter installation guide: https://docs.flutter.dev/get-started/install

### 2. Install Dependencies

```bash
cd flutter_app
flutter pub get
```

### 3. Configure Firebase

#### Option 1: Using FlutterFire CLI (Recommended)

```bash
# Install FlutterFire CLI
dart pub global activate flutterfire_cli

# Configure Firebase for your project
flutterfire configure
```

This will automatically:
- Create/update `lib/config/firebase_options.dart`
- Add Firebase configuration files to Android and iOS
- Link your app to your Firebase project

#### Option 2: Manual Configuration

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Authentication (Email/Password)
   - Create a Firestore Database

2. **Android Setup**
   - In Firebase Console, add an Android app
   - Download `google-services.json`
   - Place it in `android/app/`

3. **iOS Setup**
   - In Firebase Console, add an iOS app
   - Download `GoogleService-Info.plist`
   - Place it in `ios/Runner/`

4. **Update Firebase Options**
   - Edit `lib/config/firebase_options.dart` with your Firebase configuration

### 4. Configure API URLs

Update the API URLs in `lib/services/api_service.dart`:

```dart
static const String baseUrl = 'http://YOUR_BACKEND_URL:3000/api';
static const String cvServiceUrl = 'http://YOUR_CV_SERVICE_URL:5000/api';
```

**Important for Android Emulator**: Use `10.0.2.2` instead of `localhost`
**Important for iOS Simulator**: Use your computer's IP address instead of `localhost`

### 5. Run the App

```bash
# Check for issues
flutter doctor

# Run on connected device/emulator
flutter run

# Build for release
flutter build apk  # Android
flutter build ios  # iOS
```

## Project Structure

```
flutter_app/
├── lib/
│   ├── config/              # Configuration files
│   │   └── firebase_options.dart
│   ├── models/              # Data models
│   │   ├── user_profile.dart
│   │   └── workout.dart
│   ├── screens/             # UI screens
│   │   ├── auth/           # Authentication screens
│   │   ├── home/           # Home/dashboard
│   │   ├── workout/        # Workout screen
│   │   ├── history/        # Workout history
│   │   └── profile/        # User profile
│   ├── services/            # Business logic
│   │   ├── auth_service.dart
│   │   └── api_service.dart
│   ├── widgets/             # Reusable widgets
│   └── main.dart           # App entry point
├── android/                 # Android-specific files
├── ios/                     # iOS-specific files
└── pubspec.yaml            # Dependencies
```

## Dependencies

### Core
- `firebase_core`: Firebase SDK initialization
- `firebase_auth`: Firebase Authentication
- `cloud_firestore`: Cloud Firestore database

### State Management
- `provider`: State management solution

### UI
- `google_fonts`: Custom fonts
- `fl_chart`: Charts and graphs

### Camera & Media
- `camera`: Camera access
- `image_picker`: Image selection

### Networking
- `http`: HTTP requests
- `dio`: Advanced HTTP client

### Storage
- `shared_preferences`: Local key-value storage

### Utils
- `intl`: Internationalization and formatting

## Firebase Setup Instructions

### Enable Authentication

1. Go to Firebase Console → Authentication
2. Click "Get Started"
3. Enable "Email/Password" sign-in method

### Configure Firestore

1. Go to Firebase Console → Firestore Database
2. Click "Create Database"
3. Start in production mode (recommended)
4. Add security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /workouts/{workoutId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Development

### Running Tests

```bash
flutter test
```

### Code Generation

```bash
# Generate code (if using code generation)
flutter pub run build_runner build
```

### Linting

```bash
flutter analyze
```

### Format Code

```bash
flutter format .
```

## Building for Production

### Android

```bash
# Build APK
flutter build apk --release

# Build App Bundle (for Play Store)
flutter build appbundle --release
```

### iOS

```bash
# Build for iOS
flutter build ios --release

# Build IPA
flutter build ipa
```

## Troubleshooting

### Common Issues

1. **Firebase initialization error**
   - Ensure `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) are in the correct locations
   - Run `flutterfire configure` again

2. **Network error connecting to backend**
   - Check API URLs in `api_service.dart`
   - Use correct IP address for emulator/simulator
   - Ensure backend is running

3. **Camera permission denied**
   - Add camera permissions to AndroidManifest.xml (already included)
   - Request permissions in iOS Info.plist

4. **Build failures**
   - Run `flutter clean`
   - Run `flutter pub get`
   - Try again

### Android Emulator Network

To access localhost from Android emulator:
- Use `10.0.2.2` instead of `localhost` or `127.0.0.1`

### iOS Simulator Network

To access localhost from iOS simulator:
- Use your computer's local IP address
- Or use `localhost` (should work on iOS)

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review Firebase documentation: https://firebase.google.com/docs
- Review Flutter documentation: https://docs.flutter.dev
