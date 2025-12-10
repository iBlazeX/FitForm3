# FitForm - Complete Setup Guide

## 🏋️ AI-Powered Fitness Platform

FitForm uses computer vision to detect exercises (push-ups, squats, sit-ups), count reps, and evaluate form in real-time.

---

## 📋 Prerequisites

### Required Software
- **Docker** and **Docker Compose** (for containerized deployment)
- **Node.js** >= 18 (for local development)
- **Python** >= 3.9 (for CV service development)
- **Firebase Project** (for authentication and database)

### Optional (for mobile app)
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go app** on your phone (iOS/Android)

---

## 🔥 Firebase Setup (Required)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `fitform` (or your choice)
4. Enable/disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Enable Authentication

1. In Firebase Console, click **"Authentication"** → **"Get started"**
2. Click **"Email/Password"** under Sign-in providers
3. Enable **"Email/Password"**
4. Click **"Save"**

### Step 3: Create Firestore Database

1. Click **"Firestore Database"** → **"Create database"**
2. Choose **"Start in production mode"**
3. Select a location closest to your users
4. Click **"Done"**

### Step 4: Add Security Rules

In Firestore, go to **Rules** tab and replace with:

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

### Step 5: Get Backend Credentials

1. Go to **Project Settings** (gear icon) → **"Service accounts"**
2. Click **"Generate new private key"** → **"Generate key"**
3. Save the downloaded JSON file securely

### Step 6: Get Web/Mobile App Credentials

1. Go to **Project Settings** → **"General"**
2. Scroll to **"Your apps"** → Click web icon (`</>`)
3. Register app name: `FitForm Web`
4. Copy the `firebaseConfig` object

---

## 🐳 Quick Start with Docker (Recommended)

### Step 1: Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```bash
PORT=3000
CV_SERVICE_URL=http://cv-service:5000
CORS_ORIGINS=http://localhost,http://localhost:3001

# Option 1: Paste entire service account JSON (minified to one line)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project",...}

# Option 2: Or use file path
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
```

### Step 2: Configure Web App (Optional for Docker)

Create `web-app/.env`:
```bash
REACT_APP_API_URL=/api
REACT_APP_CV_SERVICE_URL=http://localhost:5000/api

# Firebase config from Step 6
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### Step 3: Build and Run

```bash
# From project root
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Step 4: Access Services

| Service | URL |
|---------|-----|
| Web App | http://localhost |
| Backend API | http://localhost:3000 |
| CV Service | http://localhost:5000 |
| API Health | http://localhost:3000/health |
| CV Health | http://localhost:5000/health |

### Stop Services

```bash
docker-compose down
```

---

## 💻 Local Development Setup

### 1. CV Service (Python)

```bash
cd cv-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
cd src
python app.py
```
Service runs at: http://localhost:5000

### 2. Backend API (Node.js)

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Firebase credentials

# Run development server
npm run dev
```
API runs at: http://localhost:3000

### 3. Web App (React)

```bash
cd web-app

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Firebase config

# Run development server
npm start
```
App runs at: http://localhost:3001

### 4. Mobile App (Expo)

```bash
cd mobile-app

# Install dependencies
npm install

# Configure Firebase
# Edit src/config/firebase.js with your credentials

# Start Expo
npm start
```

Scan QR code with Expo Go app on your phone.

---

## 📱 Mobile App Configuration

Edit `mobile-app/src/config/firebase.js`:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Replace with your server IP (NOT localhost for physical devices)
export const CV_SERVICE_URL = 'http://YOUR_SERVER_IP:5000/api';
export const API_URL = 'http://YOUR_SERVER_IP:3000/api';
```

**Note**: Physical devices cannot use `localhost`. Use your computer's local IP address (e.g., `192.168.1.100`).

---

## 🔧 API Endpoints

### Health Checks
- `GET /health` - Backend health
- `GET /health` - CV service health (port 5000)

### Authentication
- `POST /api/auth/register` - Register user
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Workouts
- `POST /api/workouts` - Save workout
- `GET /api/workouts/history` - Get history
- `GET /api/workouts/stats` - Get statistics
- `DELETE /api/workouts/:id` - Delete workout

### CV Service
- `POST /api/detect` - Detect exercise from image
- `POST /api/reset` - Reset counter
- `GET /api/exercises` - List exercises

---

## 🧪 Testing the Setup

### 1. Test CV Service
```bash
curl http://localhost:5000/health
# Expected: {"status": "healthy", "service": "cv-service", "version": "1.0.0"}
```

### 2. Test Backend API
```bash
curl http://localhost:3000/health
# Expected: {"status": "healthy", "service": "backend-api", ...}
```

### 3. Test Exercises Endpoint
```bash
curl http://localhost:5000/api/exercises
# Returns list of supported exercises
```

### 4. Test Web App
Open http://localhost in browser and:
1. Click "Sign up" to create account
2. Log in with credentials
3. Navigate to Workout page
4. Allow camera access
5. Try doing push-ups!

---

## 🚨 Troubleshooting

### Docker Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs cv-service
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

**Port already in use:**
```bash
# Find process using port
lsof -i :3000  # or :5000, :80

# Kill process or change port in docker-compose.yml
```

### Firebase Issues

**"Firebase app already initialized":**
- This is handled by the code, but if it persists, restart the service

**"Permission denied" in Firestore:**
- Check security rules in Firebase Console
- Ensure user is authenticated before making requests

### Camera Issues (Web)

**Camera not working:**
- Use HTTPS in production (camera requires secure context)
- For local dev, use localhost (allowed exception)
- Check browser permissions

### Mobile App Issues

**Cannot connect to server:**
- Use computer's IP address, not `localhost`
- Ensure phone and computer are on same network
- Check firewall settings

---

## 📊 Project Structure

```
fitform/
├── cv-service/           # Python CV/AI Service
│   ├── src/
│   │   ├── app.py                # Flask API
│   │   ├── pose_detector.py      # MediaPipe wrapper
│   │   └── exercise_detectors.py # Exercise detection
│   ├── requirements.txt
│   └── Dockerfile
├── backend/              # Node.js Backend
│   ├── src/
│   │   ├── index.js             # Express server
│   │   ├── config/firebase.js   # Firebase init
│   │   ├── middleware/auth.js   # Auth middleware
│   │   └── routes/              # API routes
│   ├── package.json
│   └── Dockerfile
├── web-app/              # React Web App
│   ├── src/
│   │   ├── App.js               # Main component
│   │   ├── pages/               # Page components
│   │   ├── services/api.js      # API client
│   │   └── contexts/            # React contexts
│   ├── package.json
│   └── Dockerfile
├── mobile-app/           # Expo React Native
│   ├── src/
│   │   ├── screens/             # Screen components
│   │   ├── services/api.js      # API client
│   │   └── config/firebase.js   # Firebase config
│   ├── App.js
│   └── package.json
├── docker-compose.yml
└── SETUP.md (this file)
```

---

## 🚀 Production Deployment

For production deployment:

1. **Use HTTPS** - Required for camera access
2. **Set secure secrets** - Use strong JWT_SECRET
3. **Configure CORS** - Restrict to your domains
4. **Enable rate limiting** - Already configured
5. **Use managed services** - Consider Firebase Hosting, Cloud Run

See `DEPLOYMENT.md` for detailed cloud deployment guides.

---

## 📝 License

MIT License - See LICENSE file for details.
