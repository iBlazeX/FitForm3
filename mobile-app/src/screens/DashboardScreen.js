/**
 * Dashboard Screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { workoutAPI } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await workoutAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.totalWorkouts || 0}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.totalReps || 0}</Text>
          <Text style={styles.statLabel}>Total Reps</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{(stats?.totalCalories || 0).toFixed(0)}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{Math.floor((stats?.totalDuration || 0) / 60)}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
      </View>

      {/* Quick Start */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('Workout')}
      >
        <Text style={styles.startButtonText}>💪 Start Workout</Text>
      </TouchableOpacity>

      {/* Exercise Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercise Breakdown</Text>
        
        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseIcon}>💪</Text>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>Push-ups</Text>
            <Text style={styles.exerciseStats}>
              {stats?.byExercise?.pushup?.reps || 0} reps • {stats?.byExercise?.pushup?.count || 0} sessions
            </Text>
          </View>
        </View>

        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseIcon}>🦵</Text>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>Squats</Text>
            <Text style={styles.exerciseStats}>
              {stats?.byExercise?.squat?.reps || 0} reps • {stats?.byExercise?.squat?.count || 0} sessions
            </Text>
          </View>
        </View>

        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseIcon}>🏋️</Text>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>Sit-ups</Text>
            <Text style={styles.exerciseStats}>
              {stats?.byExercise?.situp?.reps || 0} reps • {stats?.byExercise?.situp?.count || 0} sessions
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Workouts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        
        {stats?.recentWorkouts?.length > 0 ? (
          stats.recentWorkouts.slice(0, 3).map((workout, index) => (
            <View key={index} style={styles.recentCard}>
              <Text style={styles.recentIcon}>
                {workout.exerciseType === 'pushup' ? '💪' : 
                 workout.exerciseType === 'squat' ? '🦵' : '🏋️'}
              </Text>
              <View style={styles.recentInfo}>
                <Text style={styles.recentName}>
                  {workout.exerciseType.charAt(0).toUpperCase() + workout.exerciseType.slice(1)}s
                </Text>
                <Text style={styles.recentDate}>
                  {new Date(workout.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.recentReps}>{workout.reps} reps</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No workouts yet. Start your first one!</Text>
        )}
      </View>
    </ScrollView>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5'
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textTransform: 'uppercase'
  },
  startButton: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center'
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  section: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937'
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8
  },
  exerciseIcon: {
    fontSize: 32,
    marginRight: 16
  },
  exerciseInfo: {
    flex: 1
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937'
  },
  exerciseStats: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8
  },
  recentIcon: {
    fontSize: 24,
    marginRight: 12
  },
  recentInfo: {
    flex: 1
  },
  recentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937'
  },
  recentDate: {
    fontSize: 12,
    color: '#6B7280'
  },
  recentReps: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5'
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    padding: 20
  }
});
