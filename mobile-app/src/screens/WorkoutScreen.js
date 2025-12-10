/**
 * Workout Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';

export default function WorkoutScreen() {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  const exercises = [
    { id: 'pushup', name: 'Push-ups', icon: '💪' },
    { id: 'squat', name: 'Squats', icon: '🦵' },
    { id: 'situp', name: 'Sit-ups', icon: '🏋️' },
  ];

  const requestCameraPermission = async () => {
    // Camera functionality will be implemented in future update
    Alert.alert(
      'Camera Feature Coming Soon',
      'Camera-based exercise detection will be available in the next update.'
    );
  };

  const handleExerciseSelect = async (exercise) => {
    setSelectedExercise(exercise);
    await requestCameraPermission();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Start a Workout</Text>
        <Text style={styles.subtitle}>Choose an exercise to begin</Text>
      </View>

      <View style={styles.exercisesContainer}>
        {exercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={[
              styles.exerciseCard,
              selectedExercise?.id === exercise.id && styles.exerciseCardSelected
            ]}
            onPress={() => handleExerciseSelect(exercise)}
          >
            <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedExercise && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Camera Integration Coming Soon!</Text>
          <Text style={styles.infoText}>
            The camera-based exercise detection feature will be available in the next update.
            For now, you can use the web app for live exercise detection.
          </Text>
          <Text style={styles.infoText}>
            Features in development:
          </Text>
          <Text style={styles.bulletPoint}>• Real-time rep counting</Text>
          <Text style={styles.bulletPoint}>• Form evaluation</Text>
          <Text style={styles.bulletPoint}>• Calorie tracking</Text>
          <Text style={styles.bulletPoint}>• Workout history</Text>
        </View>
      )}

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How it works:</Text>
        <Text style={styles.instructionText}>
          1. Select an exercise from the options above
        </Text>
        <Text style={styles.instructionText}>
          2. Position your camera to capture your full body
        </Text>
        <Text style={styles.instructionText}>
          3. Start exercising and let FitForm count your reps
        </Text>
        <Text style={styles.instructionText}>
          4. Get real-time feedback on your form
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  exercisesContainer: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  exerciseCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  exerciseCardSelected: {
    borderColor: '#007AFF',
  },
  exerciseIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#B37400',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginBottom: 5,
  },
  instructionsContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
});
