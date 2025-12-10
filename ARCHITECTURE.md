# FitForm Architecture

## System Overview

FitForm is a microservices-based fitness platform with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                       │
│  ┌──────────────────┐              ┌──────────────────┐     │
│  │   Web Browser    │              │  Mobile Device   │     │
│  │   (React App)    │              │   (Expo App)     │     │
│  └────────┬─────────┘              └────────┬─────────┘     │
└───────────┼──────────────────────────────────┼──────────────┘
            │                                   │
            └───────────────┬───────────────────┘
                            │
            ┌───────────────▼────────────────┐
            │         Load Balancer          │
            │           (Nginx)              │
            └───────────────┬────────────────┘
                            │
          ┌─────────────────┴──────────────────┐
          │                                    │
┌─────────▼──────────┐              ┌─────────▼──────────┐
│   Backend API      │              │   CV/AI Service    │
│   (Node.js)        │◄────────────►│   (Python/Flask)   │
│   - Firebase Auth  │              │   - Pose Detection │
│   - Firestore      │              │   - Rep Counting   │
│   - Workouts       │              │   - Form Eval      │
└─────────┬──────────┘              └────────────────────┘
          │
          │
┌─────────▼──────────┐
│     Firebase       │
│   - Authentication │
│   - Firestore DB   │
│     • users        │
│     • workouts     │
└────────────────────┘
```

## Component Details

### 1. CV/AI Service (Python)

**Responsibilities:**
- Real-time pose detection using MediaPipe
- Exercise classification (push-up, squat, sit-up)
- Rep counting with state machine
- Form evaluation and feedback
- Angle calculations

**Key Technologies:**
- Python 3.9+
- Flask (REST API)
- MediaPipe (Pose detection)
- OpenCV (Image processing)
- NumPy (Numerical computations)

**API Endpoints:**
- POST /api/detect - Process frame and detect exercise
- POST /api/reset - Reset rep counter
- GET /api/exercises - List supported exercises
- GET /health - Health check

### 2. Backend API (Node.js)

**Responsibilities:**
- User authentication and authorization (Firebase)
- User profile management
- Workout data persistence (Firestore)
- Statistics calculation
- API gateway for CV service

**Key Technologies:**
- Node.js 18+
- Express.js (Web framework)
- Firebase Admin SDK
- Firebase Authentication
- Firestore (NoSQL database)

**API Endpoints:**
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/auth/profile - Get user profile
- PUT /api/auth/profile - Update profile
- POST /api/workouts - Save workout
- GET /api/workouts/history - Get workout history
- GET /api/workouts/stats - Get statistics
- DELETE /api/workouts/:id - Delete workout

### 3. Web Application (React)

**Responsibilities:**
- User interface for web browsers
- Camera integration
- Real-time exercise visualization
- Dashboard and analytics
- User authentication UI

**Key Technologies:**
- React 18
- React Router (Navigation)
- Recharts (Data visualization)
- react-webcam (Camera access)
- Axios (HTTP client)

**Key Features:**
- Login/Register pages
- Dashboard with statistics
- Live workout with camera
- Workout history
- User profile management

### 4. Mobile Application (Expo React Native)

**Responsibilities:**
- Native iOS and Android mobile interface
- Web support through Expo
- Camera integration for mobile
- Firebase authentication
- Real-time data sync with Firestore
- Offline support (future)
- Push notifications (future)

**Key Technologies:**
- Expo SDK
- React Native 0.82
- React Navigation
- Firebase Client SDK
- expo-camera
- AsyncStorage

## Data Models

### User Model (Firestore)
```javascript
// Collection: users
// Document ID: Firebase Auth UID
{
  username: String,
  email: String,
  profile: {
    age: Number,
    weight: Number,
    height: Number,
    gender: String,
    fitnessGoal: String
  },
  createdAt: String (ISO timestamp)
}
```

**Note**: Passwords are managed by Firebase Authentication, not stored in Firestore.

### Workout Model (Firestore)
```javascript
// Collection: workouts
// Document ID: Auto-generated
{
  userId: String (Firebase Auth UID),
  exerciseType: String (enum: pushup/squat/situp),
  reps: Number,
  caloriesBurned: Number,
  duration: Number (seconds),
  formFeedback: Array<String>,
  date: String (ISO timestamp)
}
```

## Security

### Authentication
- Firebase Authentication with email/password
- Firebase ID tokens for API authentication
- Custom tokens for backend compatibility
- Automatic token refresh
- Secure session management

### Authorization
- Protected routes require valid Firebase ID token
- User can only access their own data
- Middleware validates tokens on each request
- Firebase Security Rules for Firestore

### Data Protection
- HTTPS in production
- CORS configuration
- Input validation
- Rate limiting (implemented):
  - General API: 100 requests per 15 minutes
  - Authentication: 10 requests per 15 minutes
  - CV detection: 30 requests per minute
  - CV reset: 10 requests per minute
- Firebase Security Rules for data access control

## Scalability Considerations

### Horizontal Scaling
- Backend API: Multiple instances behind load balancer
- CV Service: Multiple instances for parallel processing
- Database: Firebase Firestore (auto-scales)
- Serverless options available with Firebase Functions

### Caching
- Firebase local caching (offline persistence)
- CDN for static assets
- Response caching for statistics

### Performance Optimization
- Image compression before sending to CV service
- Lazy loading of workout history
- Pagination for large datasets
- Firestore query optimization with indexes

## Deployment Strategy

### Development
```
docker-compose up
```

### Production
1. Build Docker images
2. Push to container registry
3. Deploy to Kubernetes/ECS/Cloud Run
4. Configure load balancer
5. Set up Firebase project (Authentication + Firestore)
6. Configure Firebase credentials in environment
7. Configure SSL/TLS
8. Set up monitoring and logging

### Monitoring
- Application logs
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Uptime monitoring
- Database metrics

## Future Enhancements

1. **Additional Exercises**: Planks, lunges, burpees
2. **Video Recording**: Save workout videos
3. **Social Features**: Share workouts, challenges
4. **AI Coach**: Personalized workout plans
5. **Wearable Integration**: Sync with fitness trackers
6. **Offline Mode**: Work without internet
7. **Multi-language Support**: Internationalization
8. **Advanced Analytics**: ML-based insights
