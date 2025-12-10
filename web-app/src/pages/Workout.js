/**
 * Workout Page
 * Real-time exercise detection with camera
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { cvAPI, workoutAPI } from '../services/api';
import './Workout.css';

const EXERCISES = [
  { id: 'pushup', name: 'Push-ups', icon: '💪', calories: 0.35 },
  { id: 'squat', name: 'Squats', icon: '🦵', calories: 0.32 },
  { id: 'situp', name: 'Sit-ups', icon: '🏋️', calories: 0.25 }
];

const Workout = () => {
  const webcamRef = useRef(null);
  const [selectedExercise, setSelectedExercise] = useState('pushup');
  const [isActive, setIsActive] = useState(false);
  const [count, setCount] = useState(0);
  const [stage, setStage] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [calories, setCalories] = useState(0);
  const [duration, setDuration] = useState(0);
  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [annotatedImage, setAnnotatedImage] = useState('');
  const [debugAngles, setDebugAngles] = useState({ elbow: null, body: null, postureOk: null });
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  // Capture and send frame to CV service
  const captureFrame = useCallback(async () => {
    if (!webcamRef.current || !isActive) return;

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      const result = await cvAPI.detect(imageSrc, selectedExercise, sessionIdRef.current, true);
      
      setCount(result.count || 0);
      setStage(result.stage);
      setFeedback(result.form_feedback || []);
      setCalories(result.calories_burned || 0);
      if (result.annotated_image) {
        setAnnotatedImage(result.annotated_image);
      }
      if (result.elbow_angle !== undefined || result.body_angle !== undefined) {
        setDebugAngles({
          elbow: result.elbow_angle,
          body: result.body_angle,
          postureOk: result.posture_ok
        });
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  }, [isActive, selectedExercise]);

  // Start/stop workout
  useEffect(() => {
    if (isActive) {
      // Capture frames every 100ms (~10 FPS) for smoother counting
      intervalRef.current = setInterval(captureFrame, 100);
      
      // Timer for duration
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, captureFrame]);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      // Clean up the session when leaving the page
      cvAPI.cleanup(sessionIdRef.current).catch(() => {});
    };
  }, []);

  const handleStart = async () => {
    setError('');
    setSuccess('');
    
    // Generate a new session ID for this workout
    sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Reset CV service counter with the new session
    try {
      await cvAPI.reset(selectedExercise, sessionIdRef.current);
    } catch (err) {
      console.error('Reset error:', err);
    }

    setCount(0);
    setStage(null);
    setFeedback([]);
    setCalories(0);
    setDuration(0);
    setAnnotatedImage('');
    setDebugAngles({ elbow: null, body: null, postureOk: null });
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
  };

  const handleSave = async () => {
    if (count === 0) {
      setError('No reps to save. Start a workout first!');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await workoutAPI.save({
        exerciseType: selectedExercise,
        reps: count,
        caloriesBurned: calories,
        duration: duration,
        formFeedback: feedback
      });
      
      setSuccess('Workout saved successfully!');
      
      // Cleanup old session from CV service
      try {
        await cvAPI.cleanup(sessionIdRef.current);
      } catch (cleanupErr) {
        console.warn('Session cleanup failed:', cleanupErr);
      }
      
      // Reset UI for new workout
      setCount(0);
      setStage(null);
      setFeedback([]);
      setCalories(0);
      setDuration(0);
      setAnnotatedImage('');
      setDebugAngles({ elbow: null, body: null, postureOk: null });
    } catch (err) {
      console.error('Save error:', err);
      const message = err?.response?.data?.error || err?.message || 'Failed to save workout. Please try again.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const exercise = EXERCISES.find(e => e.id === selectedExercise);

  return (
    <div className="container">
      <div className="workout-page">
        {/* Exercise Selection */}
        <div className="exercise-selector">
          {EXERCISES.map((ex) => (
            <button
              key={ex.id}
              className={`exercise-btn ${selectedExercise === ex.id ? 'active' : ''}`}
              onClick={() => {
                if (!isActive) setSelectedExercise(ex.id);
              }}
              disabled={isActive}
            >
              <span className="exercise-icon">{ex.icon}</span>
              <span className="exercise-name">{ex.name}</span>
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="workout-content">
          {/* Camera View */}
          <div className="camera-section">
            <div className="camera-container">
              {/* Always keep webcam mounted for continuous frame capture */}
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: "user"
                }}
                className={isActive && annotatedImage ? "camera-feed-hidden" : "camera-feed"}
              />
              
              {/* Show annotated image overlay when available and active */}
              {isActive && annotatedImage && (
                <img 
                  src={annotatedImage} 
                  alt="Pose detection" 
                  className="camera-feed annotated"
                />
              )}
              
              {/* Overlay Stats */}
              <div className="camera-overlay">
                <div className="overlay-stat">
                  <div className="overlay-value">{count}</div>
                  <div className="overlay-label">REPS</div>
                </div>
                <div className="overlay-stat">
                  <div className="overlay-value">{stage || '-'}</div>
                  <div className="overlay-label">STAGE</div>
                </div>
                {debugAngles.elbow !== null && (
                  <div className="overlay-stat debug">
                    <div className="overlay-value">{debugAngles.elbow.toFixed(0)}</div>
                    <div className="overlay-label">ELBOW°</div>
                  </div>
                )}
                {debugAngles.body !== null && (
                  <div className="overlay-stat debug">
                    <div className="overlay-value">{debugAngles.body.toFixed(0)}</div>
                    <div className="overlay-label">BODY° {debugAngles.postureOk ? 'OK' : 'BAD'}</div>
                  </div>
                )}
              </div>

              {/* Status indicator */}
              <div className={`status-indicator ${isActive ? 'active' : ''}`}>
                {isActive ? '● RECORDING' : '○ READY'}
              </div>
            </div>
            
            {/* Toggle for showing skeleton overlay */}
            <div className="view-toggle">
              <span className={!annotatedImage || !isActive ? 'active' : ''}>📷 Live</span>
              <span className={annotatedImage && isActive ? 'active' : ''}>🦴 Skeleton</span>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="stats-panel">
            <h2>{exercise?.icon} {exercise?.name}</h2>

            <div className="workout-stats-grid">
              <div className="workout-stat">
                <div className="stat-value large">{count}</div>
                <div className="stat-label">Reps</div>
              </div>
              <div className="workout-stat">
                <div className="stat-value">{calories.toFixed(1)}</div>
                <div className="stat-label">Calories</div>
              </div>
              <div className="workout-stat">
                <div className="stat-value">{formatDuration(duration)}</div>
                <div className="stat-label">Duration</div>
              </div>
            </div>

            {/* Feedback */}
            <div className="feedback-section">
              <h4>Form Feedback</h4>
              {feedback.length > 0 ? (
                <ul className="feedback-list">
                  {feedback.map((fb, idx) => (
                    <li key={idx} className={fb.includes('Good') ? 'good' : 'warning'}>
                      {fb}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-feedback">Start exercising to get feedback</p>
              )}
            </div>

            {/* Controls */}
            <div className="workout-controls">
              {!isActive ? (
                <button className="btn btn-success btn-large" onClick={handleStart}>
                  ▶ Start Workout
                </button>
              ) : (
                <button className="btn btn-danger btn-large" onClick={handleStop}>
                  ⏹ Stop Workout
                </button>
              )}
              
              <button 
                className="btn btn-primary btn-large" 
                onClick={handleSave}
                disabled={saving || isActive || count === 0}
              >
                {saving ? 'Saving...' : '💾 Save Workout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workout;
