/**
 * Profile Page
 * User profile management
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    fitnessGoal: '',
    dailyCalorieGoal: '',
    dailyRepsGoal: '',
    weeklyWorkoutGoal: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        age: profile.profile?.age || '',
        weight: profile.profile?.weight || '',
        height: profile.profile?.height || '',
        gender: profile.profile?.gender || '',
        fitnessGoal: profile.profile?.fitnessGoal || '',
        dailyCalorieGoal: profile.profile?.dailyCalorieGoal || '',
        dailyRepsGoal: profile.profile?.dailyRepsGoal || '',
        weeklyWorkoutGoal: profile.profile?.weeklyWorkoutGoal || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile({
        username: formData.username,
        profile: {
          age: formData.age ? parseInt(formData.age) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          height: formData.height ? parseFloat(formData.height) : null,
          gender: formData.gender || null,
          fitnessGoal: formData.fitnessGoal || null,
          dailyCalorieGoal: formData.dailyCalorieGoal ? parseInt(formData.dailyCalorieGoal) : null,
          dailyRepsGoal: formData.dailyRepsGoal ? parseInt(formData.dailyRepsGoal) : null,
          weeklyWorkoutGoal: formData.weeklyWorkoutGoal ? parseInt(formData.weeklyWorkoutGoal) : null
        }
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="profile-page">
        <h1>Profile Settings</h1>
        <p className="profile-subtitle">Manage your personal information and fitness goals</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="card">
            <h3 className="card-title">Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Your username"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  className="form-input"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Your age"
                  min="1"
                  max="150"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="weight">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  className="form-input"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Your weight in kg"
                  step="0.1"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="height">Height (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  className="form-input"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="Your height in cm"
                  step="0.1"
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                className="form-input"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Fitness Goals</h3>
            
            <div className="form-group">
              <label className="form-label" htmlFor="fitnessGoal">Your Fitness Goal</label>
              <select
                id="fitnessGoal"
                name="fitnessGoal"
                className="form-input"
                value={formData.fitnessGoal}
                onChange={handleChange}
              >
                <option value="">Select a goal</option>
                <option value="lose_weight">Lose Weight</option>
                <option value="build_muscle">Build Muscle</option>
                <option value="improve_endurance">Improve Endurance</option>
                <option value="stay_active">Stay Active</option>
                <option value="flexibility">Improve Flexibility</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>

            <div className="goal-tips">
              <h4>Tips for your goal</h4>
              {formData.fitnessGoal === 'lose_weight' && (
                <p>Focus on high-rep exercises and maintain consistency. Combine with a balanced diet for best results.</p>
              )}
              {formData.fitnessGoal === 'build_muscle' && (
                <p>Challenge yourself with more reps each session. Proper form is crucial for muscle development.</p>
              )}
              {formData.fitnessGoal === 'improve_endurance' && (
                <p>Gradually increase workout duration and minimize rest between sets.</p>
              )}
              {formData.fitnessGoal === 'stay_active' && (
                <p>Aim for regular workouts, even if they're short. Consistency matters more than intensity.</p>
              )}
              {formData.fitnessGoal === 'flexibility' && (
                <p>Include dynamic movements and maintain full range of motion in all exercises.</p>
              )}
              {formData.fitnessGoal === 'general_fitness' && (
                <p>Mix different exercises to work various muscle groups. Balance is key!</p>
              )}
              {!formData.fitnessGoal && (
                <p className="muted">Select a goal to see personalized tips.</p>
              )}
            </div>

            <h4 style={{ marginTop: '24px', marginBottom: '16px' }}>Daily & Weekly Targets</h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="dailyCalorieGoal">Daily Calorie Goal</label>
                <input
                  type="number"
                  id="dailyCalorieGoal"
                  name="dailyCalorieGoal"
                  className="form-input"
                  value={formData.dailyCalorieGoal}
                  onChange={handleChange}
                  placeholder="e.g., 200"
                  min="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="dailyRepsGoal">Daily Reps Goal</label>
                <input
                  type="number"
                  id="dailyRepsGoal"
                  name="dailyRepsGoal"
                  className="form-input"
                  value={formData.dailyRepsGoal}
                  onChange={handleChange}
                  placeholder="e.g., 100"
                  min="1"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="weeklyWorkoutGoal">Weekly Workout Goal</label>
              <input
                type="number"
                id="weeklyWorkoutGoal"
                name="weeklyWorkoutGoal"
                className="form-input"
                value={formData.weeklyWorkoutGoal}
                onChange={handleChange}
                placeholder="e.g., 5 workouts per week"
                min="1"
                max="21"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
