# Firebase Migration Guide

This guide helps you set up Firebase for the FitForm application after migrating from MongoDB.

## Prerequisites

- A Google account
- Node.js >= 16 installed
- Basic understanding of Firebase

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `fitform` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, select your project
2. Click on "Authentication" in the left sidebar
3. Click "Get started"
4. Click on "Email/Password" under Sign-in providers
5. Enable "Email/Password"
6. Click "Save"

## Step 3: Create Firestore Database

1. Click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" (recommended) or "test mode" for development
4. Select a location closest to your users
5. Click "Done"

### Security Rules for Production

Replace the default rules with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
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

## Step 4: Get Backend Credentials

### For Node.js Backend (Firebase Admin SDK)

1. In Firebase Console, go to Project Settings (gear icon)
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Click "Generate key" - this downloads a JSON file
5. **Keep this file secure! Never commit it to version control**

### Configure Backend

**Option 1: Environment Variable (Recommended for Production)**

1. Open the downloaded JSON file
2. Minify it to a single line (remove all line breaks)
3. Add to your backend `.env` file:

```bash
PORT=3000
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project",...}
CV_SERVICE_URL=http://localhost:5000
```

**Option 2: File Path (Recommended for Development)**

1. Save the JSON file in a secure location (e.g., `backend/serviceAccountKey.json`)
2. Add to `.gitignore`:
```
serviceAccountKey.json
```
3. Add to backend `.env` file:
```bash
PORT=3000
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
CV_SERVICE_URL=http://localhost:5000
```

## Step 5: Get Mobile App Credentials

### For Mobile App (Firebase Client SDK)

1. In Firebase Console, go to Project Settings
2. Scroll down to "Your apps"
3. Click on the Web icon (</>) to add a web app
4. Register app name: `FitForm Mobile`
5. Click "Register app"
6. Copy the `firebaseConfig` object

### Configure Mobile App

1. Open `mobile-app/src/config/firebase.js`
2. Replace the placeholder values:

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

export const CV_SERVICE_URL = 'http://your-cv-service-url:5000/api';
```

## Step 6: Test the Setup

### Test Backend

```bash
cd backend
npm install
npm start
```

You should see:
```
Server is running on port 3000
Firebase initialized successfully
Using Firebase for authentication and data storage
```

### Test Mobile App

```bash
cd mobile-app
npm install
npm start
```

Then test on your device using Expo Go app.

## Step 7: Firestore Indexes (Optional but Recommended)

For better query performance, create these indexes:

1. Go to Firestore Database → Indexes
2. Create composite index for workouts:
   - Collection: `workouts`
   - Fields: `userId` (Ascending), `date` (Descending)
   - Query scope: Collection

3. If using exercise type filtering:
   - Collection: `workouts`
   - Fields: `userId` (Ascending), `exerciseType` (Ascending), `date` (Descending)
   - Query scope: Collection

## Common Issues

### "Failed to initialize Firebase"

**Cause**: Invalid credentials or missing service account file

**Solution**:
- Verify your service account JSON is valid
- Check file path is correct
- Ensure environment variable is properly set

### "Permission denied" when accessing Firestore

**Cause**: Firestore security rules are too restrictive or user is not authenticated

**Solution**:
- Check security rules in Firebase Console
- Verify user is authenticated before making requests
- Ensure user ID matches the document owner

### "Firebase app already initialized"

**Cause**: Multiple initializations of Firebase

**Solution**:
- The code already handles this, but if you see this error, restart your development server

## Migration Notes

### Data Migration from MongoDB

If you have existing data in MongoDB, you'll need to migrate it:

1. Export data from MongoDB:
```bash
mongoexport --db fitform --collection users --out users.json
mongoexport --db fitform --collection workouts --out workouts.json
```

2. Transform the data to match Firebase structure:
   - Remove MongoDB `_id` fields
   - Convert ObjectId references to string UIDs
   - Convert dates to ISO string format
   - Hash passwords using Firebase Authentication (manual user creation)

3. Import to Firestore using Firebase Admin SDK or Firebase Console

### Authentication Migration

Users will need to recreate their accounts as Firebase uses a different authentication system. Consider:
- Sending migration emails to users
- Providing account recreation instructions
- Offering temporary migration period with both systems

## Security Best Practices

1. **Never commit credentials**
   - Add service account files to `.gitignore`
   - Use environment variables for sensitive data

2. **Use proper security rules**
   - Start with restrictive rules
   - Test rules thoroughly
   - Use the Rules Playground in Firebase Console

3. **Rotate credentials regularly**
   - Generate new service account keys periodically
   - Delete old keys from Firebase Console

4. **Monitor usage**
   - Set up Firebase billing alerts
   - Monitor authentication attempts
   - Review Firestore usage statistics

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

## Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Review server logs for detailed error information
3. Consult Firebase documentation
4. Open an issue on the GitHub repository
