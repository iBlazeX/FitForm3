/**
 * History Screen
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { workoutAPI } from '../services/api';

export default function HistoryScreen() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const data = await workoutAPI.getHistory({ limit: 50 });
      setWorkouts(data.workouts || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleDelete = async (workoutId) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutAPI.delete(workoutId);
              setWorkouts(workouts.filter(w => w.id !== workoutId));
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete workout');
            }
          }
        }
      ]
    );
  };

  const getExerciseIcon = (type) => {
    switch (type) {
      case 'pushup': return '💪';
      case 'squat': return '🦵';
      case 'situp': return '🏋️';
      default: return '🏃';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderWorkout = ({ item }) => (
    <View style={styles.workoutCard}>
      <Text style={styles.workoutIcon}>{getExerciseIcon(item.exerciseType)}</Text>
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutName}>
          {item.exerciseType.charAt(0).toUpperCase() + item.exerciseType.slice(1)}s
        </Text>
        <Text style={styles.workoutDate}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.workoutStats}>
        <Text style={styles.workoutReps}>{item.reps} reps</Text>
        <Text style={styles.workoutCalories}>{item.caloriesBurned?.toFixed(1)} cal</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.deleteBtnText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No Workouts Yet</Text>
          <Text style={styles.emptyText}>Complete your first workout to see it here!</Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkout}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  list: {
    padding: 16
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  workoutIcon: {
    fontSize: 32,
    marginRight: 12
  },
  workoutInfo: {
    flex: 1
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937'
  },
  workoutDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  workoutStats: {
    alignItems: 'flex-end',
    marginRight: 12
  },
  workoutReps: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5'
  },
  workoutCalories: {
    fontSize: 12,
    color: '#10B981'
  },
  deleteBtn: {
    padding: 8
  },
  deleteBtnText: {
    fontSize: 18
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center'
  }
});
