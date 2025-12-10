/**
 * FitForm Backend API
 * Express server with Firebase integration
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');

// Import Firebase config
const { initializeFirebase } = require('./config/firebase');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for running behind nginx/docker
app.set('trust proxy', 1);

// Initialize Firebase
initializeFirebase();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3001', 'http://localhost:19006', 'http://localhost:19000'],
  credentials: true
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 auth requests per window
  message: { error: 'Too many authentication attempts, please try again later' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'backend-api',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);

// CV Service proxy endpoint (optional - forward to CV service)
const axios = require('axios');
const CV_SERVICE_URL = process.env.CV_SERVICE_URL || 'http://localhost:5000';

app.post('/api/cv/detect', async (req, res) => {
  try {
    const response = await axios.post(`${CV_SERVICE_URL}/api/detect`, req.body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    res.json(response.data);
  } catch (error) {
    console.error('CV Service error:', error.message);
    res.status(503).json({ error: 'CV Service unavailable' });
  }
});

app.get('/api/cv/exercises', async (req, res) => {
  try {
    const response = await axios.get(`${CV_SERVICE_URL}/api/exercises`);
    res.json(response.data);
  } catch (error) {
    console.error('CV Service error:', error.message);
    res.status(503).json({ error: 'CV Service unavailable' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('Using Firebase for authentication and data storage');
});
