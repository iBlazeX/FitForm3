/**
 * Dashboard Page
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { workoutAPI } from '../services/api';
import './Dashboard.css';

// Catppuccin Mocha colors
const COLORS = ['#cba6f7', '#a6e3a1', '#f9e2af']; // Mauve, Green, Yellow
const CHART_COLORS = {
  bar: '#cba6f7',        // Mauve
  barGradient: '#89b4fa', // Blue
  grid: '#45475a',       // Surface1
  text: '#cdd6f4',       // Text
  tooltip: '#1e1e2e'     // Base
};

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await workoutAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercent = (current, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const chartData = stats ? [
    { name: 'Push-ups', reps: stats.byExercise.pushup?.reps || 0, calories: stats.byExercise.pushup?.calories || 0 },
    { name: 'Squats', reps: stats.byExercise.squat?.reps || 0, calories: stats.byExercise.squat?.calories || 0 },
    { name: 'Sit-ups', reps: stats.byExercise.situp?.reps || 0, calories: stats.byExercise.situp?.calories || 0 }
  ] : [];

  const pieData = chartData.filter(d => d.reps > 0);

  const hasGoals = stats?.goals && (stats.goals.dailyCalorieGoal || stats.goals.dailyRepsGoal || stats.goals.weeklyWorkoutGoal);

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {profile?.username || 'User'}!</h1>
          <p>Track your progress and start a new workout</p>
        </div>
        <Link to="/workout" className="btn btn-primary">
          🏋️ Start Workout
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Goal Progress Section */}
      {hasGoals && (
        <div className="card goals-card">
          <h3 className="card-title">🎯 Today's Goals</h3>
          <div className="goals-grid">
            {stats.goals.dailyCalorieGoal && (
              <div className="goal-item">
                <div className="goal-header">
                  <span className="goal-label">🔥 Calories</span>
                  <span className="goal-value">
                    {stats.todayProgress?.calories || 0} / {stats.goals.dailyCalorieGoal}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill calories" 
                    style={{ width: `${getProgressPercent(stats.todayProgress?.calories, stats.goals.dailyCalorieGoal)}%` }}
                  />
                </div>
                <span className="goal-percent">
                  {getProgressPercent(stats.todayProgress?.calories, stats.goals.dailyCalorieGoal)}%
                </span>
              </div>
            )}
            {stats.goals.dailyRepsGoal && (
              <div className="goal-item">
                <div className="goal-header">
                  <span className="goal-label">💪 Reps</span>
                  <span className="goal-value">
                    {stats.todayProgress?.reps || 0} / {stats.goals.dailyRepsGoal}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill reps" 
                    style={{ width: `${getProgressPercent(stats.todayProgress?.reps, stats.goals.dailyRepsGoal)}%` }}
                  />
                </div>
                <span className="goal-percent">
                  {getProgressPercent(stats.todayProgress?.reps, stats.goals.dailyRepsGoal)}%
                </span>
              </div>
            )}
            {stats.goals.weeklyWorkoutGoal && (
              <div className="goal-item">
                <div className="goal-header">
                  <span className="goal-label">📅 Weekly Workouts</span>
                  <span className="goal-value">
                    {stats.weekProgress?.workouts || 0} / {stats.goals.weeklyWorkoutGoal}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill workouts" 
                    style={{ width: `${getProgressPercent(stats.weekProgress?.workouts, stats.goals.weeklyWorkoutGoal)}%` }}
                  />
                </div>
                <span className="goal-percent">
                  {getProgressPercent(stats.weekProgress?.workouts, stats.goals.weeklyWorkoutGoal)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {!hasGoals && (
        <div className="card goals-card empty-goals">
          <p>🎯 Set your fitness goals in <Link to="/profile">Profile Settings</Link> to track daily progress!</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalWorkouts || 0}</div>
          <div className="stat-label">Total Workouts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalReps || 0}</div>
          <div className="stat-label">Total Reps</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{(stats?.totalCalories ?? 0).toFixed(1)}</div>
          <div className="stat-label">Calories Burned</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Math.floor((stats?.totalDuration || 0) / 60)}</div>
          <div className="stat-label">Minutes Active</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <h3 className="card-title">Reps by Exercise</h3>
          {chartData.some(d => d.reps > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="name" stroke={CHART_COLORS.text} tick={{ fill: CHART_COLORS.text }} />
                <YAxis stroke={CHART_COLORS.text} tick={{ fill: CHART_COLORS.text }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: CHART_COLORS.tooltip, 
                    border: `1px solid ${CHART_COLORS.grid}`,
                    borderRadius: '8px',
                    color: CHART_COLORS.text 
                  }}
                  labelStyle={{ color: CHART_COLORS.text }}
                />
                <Bar dataKey="reps" fill={CHART_COLORS.bar} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">
              <p>No workout data yet. Start your first workout!</p>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="card-title">Exercise Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="reps"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: CHART_COLORS.text }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: CHART_COLORS.tooltip, 
                    border: `1px solid ${CHART_COLORS.grid}`,
                    borderRadius: '8px',
                    color: CHART_COLORS.text 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">
              <p>Complete workouts to see distribution</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="card">
        <div className="card-header-flex">
          <h3 className="card-title">Recent Workouts</h3>
          <Link to="/history" className="btn btn-secondary">View All</Link>
        </div>
        {stats?.recentWorkouts?.length > 0 ? (
          <div className="workout-list">
            {stats.recentWorkouts.map((workout) => (
              <div key={workout.id} className="workout-item">
                <div className="workout-icon">
                  {workout.exerciseType === 'pushup' && '💪'}
                  {workout.exerciseType === 'squat' && '🦵'}
                  {workout.exerciseType === 'situp' && '🏋️'}
                </div>
                <div className="workout-info">
                  <div className="workout-name">
                    {workout.exerciseType.charAt(0).toUpperCase() + workout.exerciseType.slice(1)}s
                  </div>
                  <div className="workout-date">
                    {new Date(workout.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="workout-stats">
                  <span className="reps">{workout.reps} reps</span>
                  <span className="calories">{workout.caloriesBurned} cal</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No workouts yet. Start your fitness journey!</p>
            <Link to="/workout" className="btn btn-primary">Start Workout</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
