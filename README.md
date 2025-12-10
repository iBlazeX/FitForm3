# FitForm - AI-Powered Fitness Platform

FitForm is an AI-powered fitness platform that uses computer vision to detect exercises like push-ups, squats, and sit-ups from the camera, count reps, and evaluate form in real time. It tracks calories, user profiles, and workout history using Firebase for authentication and data storage.

## 🏗️ Architecture

The platform consists of four main components:

1. **Python CV/AI Service** - Computer vision service using MediaPipe and OpenCV for exercise detection
2. **Node.js Backend API** - REST API for user management, authentication, and workout data (Firebase-powered)
3. **React Web App** - Web-based user interface
4. **Expo React Native App** - Cross-platform mobile application (iOS, Android, Web)

## ✨ Features

- **Real-time Exercise Detection**: Detects push-ups, squats, and sit-ups using computer vision
- **Rep Counting**: Automatically counts repetitions during workouts
- **Form Evaluation**: Provides real-time feedback on exercise form
- **Calorie Tracking**: Calculates calories burned based on exercise type and reps
- **User Profiles**: Manage user information and fitness goals
- **Workout History**: Track and review past workout sessions
- **Statistics Dashboard**: Visualize workout progress and achievements
- **Firebase Integration**: Secure authentication and real-time data synchronization

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose (for containerized deployment)
- Node.js >= 16 (for local development)
- Python 3.9+ (for local development)
- Firebase project with Authentication and Firestore enabled
- Expo CLI (for mobile app: `npm install -g expo-cli`)

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** with Email/Password provider
3. Create a **Firestore Database** in production mode
4. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely
5. Get your web app configuration from Project Settings → General

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/iBlazeX/FitForm.git
cd FitForm

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and add your Firebase credentials

# Start all services
docker-compose up -d

# Access the application
# Web App: http://localhost
# Backend API: http://localhost:3000
# CV Service: http://localhost:5000
```

### Local Development

#### 1. Python CV Service

```bash
cd cv-service
pip install -r requirements.txt
python src/app.py
# Service runs on http://localhost:5000
```

#### 2. Node.js Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Firebase credentials
npm start
# API runs on http://localhost:3000
```

#### 3. React Web App

```bash
cd web-app
npm install
cp .env.example .env
npm start
# App runs on http://localhost:3001
```

#### 4. Expo React Native App

```bash
cd mobile-app
npm install
# Edit src/config/firebase.js with your Firebase web config
npm start
# Scan QR code with Expo Go app or press 'a' for Android, 'i' for iOS
```

## 📁 Project Structure

```
FitForm/
├── cv-service/           # Python CV/AI Service
│   ├── src/
│   │   ├── app.py                 # Flask API server
│   │   ├── pose_detector.py       # MediaPipe pose detection
│   │   └── exercise_detectors.py  # Exercise-specific detectors
│   ├── requirements.txt
│   └── Dockerfile
├── backend/              # Node.js Backend API (Firebase)
│   ├── src/
│   │   ├── index.js            # Express server
│   │   ├── config/             # Firebase configuration
│   │   ├── routes/             # API routes
│   │   └── middleware/         # Auth middleware
│   ├── package.json
│   └── Dockerfile
├── web-app/              # React Web Application
│   ├── public/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   └── contexts/           # React contexts
│   ├── package.json
│   └── Dockerfile
├── mobile-app/           # Expo React Native App
│   ├── src/
│   │   ├── screens/            # Screen components
│   │   ├── services/           # Firebase & API services
│   │   └── config/             # Firebase configuration
│   ├── app.json                # Expo configuration
│   ├── package.json
│   └── README.md
└── docker-compose.yml    # Docker Compose configuration
```

## 🔧 API Documentation

### CV Service API

#### POST `/api/detect`
Detect exercise and count reps

**Request:**
```json
{
  "image": "base64_encoded_image",
  "exercise_type": "pushup|squat|situp"
}
```

**Response:**
```json
{
  "count": 10,
  "stage": "up",
  "form_feedback": ["Good form!"],
  "calories_burned": 3.5,
  "landmarks_detected": true
}
```

#### POST `/api/reset`
Reset rep counter

**Request:**
```json
{
  "exercise_type": "pushup|squat|situp"
}
```

#### GET `/api/exercises`
Get list of supported exercises

### Backend API

#### POST `/api/auth/register`
Register new user

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "firebase_custom_token",
  "user": {
    "id": "firebase_user_id",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Note**: The backend returns a Firebase custom token. Mobile/web clients should use Firebase Client SDK for authentication and send ID tokens to the backend.

#### POST `/api/auth/login`
Login user

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Note**: For production, implement proper Firebase authentication flow using the Firebase Client SDK on the frontend.

#### GET `/api/auth/profile`
Get user profile (requires authentication)

#### PUT `/api/auth/profile`
Update user profile (requires authentication)

#### POST `/api/workouts`
Save workout (requires authentication)

**Request:**
```json
{
  "exerciseType": "pushup",
  "reps": 20,
  "caloriesBurned": 7.0,
  "duration": 120,
  "formFeedback": ["Good form!"]
}
```

#### GET `/api/workouts/history`
Get workout history (requires authentication)

Query parameters:
- `limit`: Number of workouts to return (default: 50)
- `skip`: Number of workouts to skip (default: 0)
- `exerciseType`: Filter by exercise type (optional)

#### GET `/api/workouts/stats`
Get workout statistics (requires authentication)

Query parameters:
- `period`: Number of days to include (default: 30)

#### DELETE `/api/workouts/:id`
Delete workout (requires authentication)

## 🎯 Supported Exercises

1. **Push-ups** 💪
   - Detects elbow and body angles
   - Provides feedback on form and depth

2. **Squats** 🦵
   - Detects knee angle
   - Ensures proper squat depth

3. **Sit-ups** 🏋️
   - Detects hip angle
   - Monitors proper form and range of motion

## 🔐 Environment Variables

### Backend (.env)
```
PORT=3000
# Firebase Service Account JSON (single-line string or file path)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project",...}
# OR use file path:
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
CV_SERVICE_URL=http://localhost:5000
```

**Important**: 
- Keep your Firebase service account credentials secure
- Never commit service account keys to version control
- Use environment-specific credentials for development, staging, and production

### Web App (.env)
```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_CV_SERVICE_URL=http://localhost:5000/api
# Add Firebase web config if using direct Firebase connection
```

### Mobile App (src/config/firebase.js)
```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# CV Service tests
cd cv-service
pytest

# Web App tests
cd web-app
npm test
```

## 📦 Deployment

### Cloud Deployment Options

1. **AWS**: Deploy using ECS, EC2, or Lambda
2. **Google Cloud**: Deploy using Cloud Run or GKE
3. **Azure**: Deploy using App Service or AKS
4. **Heroku**: Deploy using containers or buildpacks

### Deployment Steps

1. Build Docker images
2. Push to container registry
3. Configure environment variables
4. Deploy services
5. Set up MongoDB (Atlas recommended)
6. Configure domain and SSL

## 🛠️ Technology Stack

- **Frontend**: React, Expo React Native, React Router, Recharts
- **Backend**: Node.js, Express, Firebase Admin SDK
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **CV/AI**: Python, Flask, MediaPipe, OpenCV, NumPy
- **Mobile**: Expo, React Native
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- FitForm Team

## 🙏 Acknowledgments

- MediaPipe for pose detection
- OpenCV for computer vision
- React and React Native communities
- Firebase for authentication and database
- Expo for simplified React Native development
