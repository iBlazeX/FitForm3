/**
 * History Page
 * View and manage workout history
 */

import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../services/api';
import './History.css';

const History = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({ total: 0, hasMore: false });
  const [offset, setOffset] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchWorkouts();
  }, [filter, offset]);

  const fetchWorkouts = async () => {
    setLoading(true);
    setError('');

    try {
      const params = { limit, offset };
      if (filter !== 'all') {
        params.exerciseType = filter;
      }

      const data = await workoutAPI.getHistory(params);
      setWorkouts(data.workouts || []);
      setPagination(data.pagination || { total: 0, hasMore: false });
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load workout history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workoutId) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      await workoutAPI.delete(workoutId);
      setWorkouts(workouts.filter(w => w.id !== workoutId));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete workout');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getExerciseIcon = (type) => {
    switch (type) {
      case 'pushup': return '💪';
      case 'squat': return '🦵';
      case 'situp': return '🏋️';
      default: return '🏃';
    }
  };

  return (
    <div className="container">
      <div className="history-header">
        <h1>Workout History</h1>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => { setFilter('all'); setOffset(0); }}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'pushup' ? 'active' : ''}`}
            onClick={() => { setFilter('pushup'); setOffset(0); }}
          >
            💪 Push-ups
          </button>
          <button
            className={`filter-btn ${filter === 'squat' ? 'active' : ''}`}
            onClick={() => { setFilter('squat'); setOffset(0); }}
          >
            🦵 Squats
          </button>
          <button
            className={`filter-btn ${filter === 'situp' ? 'active' : ''}`}
            onClick={() => { setFilter('situp'); setOffset(0); }}
          >
            🏋️ Sit-ups
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : workouts.length === 0 ? (
        <div className="card empty-state">
          <h3>No workouts found</h3>
          <p>Start a workout to see your history here.</p>
        </div>
      ) : (
        <>
          <div className="history-list">
            {workouts.map((workout) => (
              <div key={workout.id} className="history-card">
                <div className="history-icon">
                  {getExerciseIcon(workout.exerciseType)}
                </div>
                <div className="history-details">
                  <h3>
                    {workout.exerciseType.charAt(0).toUpperCase() + workout.exerciseType.slice(1)}s
                  </h3>
                  <p className="history-date">{formatDate(workout.date)}</p>
                  {workout.formFeedback?.length > 0 && (
                    <div className="history-feedback">
                      {workout.formFeedback.slice(0, 2).map((fb, idx) => (
                        <span key={idx} className="feedback-tag">{fb}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="history-stats">
                  <div className="stat">
                    <span className="value">{workout.reps}</span>
                    <span className="label">reps</span>
                  </div>
                  <div className="stat">
                    <span className="value">{workout.caloriesBurned?.toFixed(1)}</span>
                    <span className="label">cal</span>
                  </div>
                  <div className="stat">
                    <span className="value">{Math.floor((workout.duration || 0) / 60)}</span>
                    <span className="label">min</span>
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(workout.id)}
                  title="Delete workout"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              className="btn btn-secondary"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
            >
              ← Previous
            </button>
            <span className="pagination-info">
              Showing {offset + 1} - {Math.min(offset + workouts.length, pagination.total)} of {pagination.total}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setOffset(offset + limit)}
              disabled={!pagination.hasMore}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default History;
