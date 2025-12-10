/**
 * Workout Screen
 * Placeholder for camera-based workout detection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { workoutAPI } from '../services/api';

const EXERCISES = [
  { id: 'pushup', name: 'Push-ups', icon: '💪', calories: 0.35 },
  { id: 'squat', name: 'Squats', icon: '🦵', calories: 0.32 },
  { id: 'situp', name: 'Sit-ups', icon: '🏋️', calories: 0.25 }
];

export default function WorkoutScreen() {
  const [selectedExercise, setSelectedExercise] = useState('pushup');
  const [reps, setReps] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [saving, setSaving] = useState(false);

  const exercise = EXERCISES.find(e => e.id === selectedExercise);
  const calories = (reps * exercise.calories).toFixed(1);

  const handleIncrement = () => {
    setReps(r => r + 1);
  };

  const handleDecrement = () => {
    setReps(r => Math.max(0, r - 1));
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Workout',
      'Are you sure you want to reset your reps?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => setReps(0) }
      ]
    );
  };

  const handleSave = async () => {
    if (reps === 0) {
      Alert.alert('No Reps', 'Add some reps before saving!');
      return;
    }

    setSaving(true);
    try {
      await workoutAPI.save({
        exerciseType: selectedExercise,
        reps,
        caloriesBurned: parseFloat(calories),
        duration: 0,
        formFeedback: []
      });
      
      Alert.alert('Success', 'Workout saved successfully!');
      setReps(0);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Exercise Selector */}
      <View style={styles.exerciseSelector}>
        {EXERCISES.map((ex) => (
          <TouchableOpacity
            key={ex.id}
            style={[
              styles.exerciseBtn,
              selectedExercise === ex.id && styles.exerciseBtnActive
            ]}
            onPress={() => {
              setSelectedExercise(ex.id);
              setReps(0);
            }}
          >
            <Text style={styles.exerciseIcon}>{ex.icon}</Text>
            <Text style={[
              styles.exerciseName,
              selectedExercise === ex.id && styles.exerciseNameActive
            ]}>
              {ex.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Camera Placeholder */}
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.placeholderIcon}>📷</Text>
        <Text style={styles.placeholderText}>Camera Detection Coming Soon</Text>
        <Text style={styles.placeholderSubtext}>
          For now, use manual rep counting below
        </Text>
      </View>

      {/* Rep Counter */}
      <View style={styles.repCounter}>
        <TouchableOpacity
          style={styles.counterBtn}
          onPress={handleDecrement}
        >
          <Text style={styles.counterBtnText}>−</Text>
        </TouchableOpacity>

        <View style={styles.counterDisplay}>
          <Text style={styles.counterValue}>{reps}</Text>
          <Text style={styles.counterLabel}>REPS</Text>
        </View>

        <TouchableOpacity
          style={styles.counterBtn}
          onPress={handleIncrement}
        >
          <Text style={styles.counterBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Calories */}
      <View style={styles.caloriesDisplay}>
        <Text style={styles.caloriesValue}>{calories}</Text>
        <Text style={styles.caloriesLabel}>calories burned</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={handleReset}
        >
          <Text style={styles.resetBtnText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving...' : 'Save Workout'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16
  },
  exerciseSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20
  },
  exerciseBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minWidth: 100
  },
  exerciseBtnActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF'
  },
  exerciseIcon: {
    fontSize: 28,
    marginBottom: 4
  },
  exerciseName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280'
  },
  exerciseNameActive: {
    color: '#4F46E5'
  },
  cameraPlaceholder: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500'
  },
  placeholderSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4
  },
  repCounter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 20
  },
  counterBtn: {
    backgroundColor: '#fff',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  counterBtnText: {
    fontSize: 32,
    color: '#4F46E5',
    fontWeight: '300'
  },
  counterDisplay: {
    alignItems: 'center'
  },
  counterValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#4F46E5'
  },
  counterLabel: {
    fontSize: 14,
    color: '#6B7280',
    letterSpacing: 2
  },
  caloriesDisplay: {
    alignItems: 'center',
    marginBottom: 24
  },
  caloriesValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#10B981'
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#6B7280'
  },
  actions: {
    flexDirection: 'row',
    gap: 12
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  resetBtnText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600'
  },
  saveBtn: {
    flex: 2,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  saveBtnDisabled: {
    opacity: 0.7
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
