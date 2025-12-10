/**
 * API Service
 * Handles all API communications
 */

import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const CV_SERVICE_URL = process.env.REACT_APP_CV_SERVICE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

// CV Service API (separate instance without auth)
const cvApi = axios.create({
  baseURL: CV_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth API
export const authAPI = {
  register: async (email, password, username) => {
    const response = await api.post('/auth/register', { email, password, username });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
  
  verifyToken: async () => {
    const response = await api.post('/auth/verify-token');
    return response.data;
  }
};

// Workout API
export const workoutAPI = {
  save: async (workoutData) => {
    const response = await api.post('/workouts', workoutData);
    return response.data;
  },
  
  getHistory: async (params = {}) => {
    const response = await api.get('/workouts/history', { params });
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/workouts/stats');
    return response.data;
  },
  
  delete: async (workoutId) => {
    const response = await api.delete(`/workouts/${workoutId}`);
    return response.data;
  }
};

// CV Service API
export const cvAPI = {
  detect: async (imageData, exerciseType, sessionId = 'default', returnImage = true) => {
    const response = await cvApi.post('/detect', {
      image: imageData,
      exercise_type: exerciseType,
      session_id: sessionId,
      return_image: returnImage
    });
    return response.data;
  },
  
  reset: async (exerciseType, sessionId = 'default') => {
    const response = await cvApi.post('/reset', {
      exercise_type: exerciseType,
      session_id: sessionId
    });
    return response.data;
  },
  
  cleanup: async (sessionId) => {
    const response = await cvApi.post('/cleanup', {
      session_id: sessionId
    });
    return response.data;
  },
  
  getExercises: async () => {
    const response = await cvApi.get('/exercises');
    return response.data;
  }
};

export default api;
