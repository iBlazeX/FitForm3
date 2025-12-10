/**
 * Dashboard Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { workoutAPI } from '../services/api';

export default function DashboardScreen() {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await workoutAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      Alert.alert('Error', 'Failed to load statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {profile?.username || 'User'}! 👋</Text>
        <Text style={styles.subGreeting}>Ready to get fit?</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalWorkouts || 0}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalReps || 0}</Text>
            <Text style={styles.statLabel}>Total Reps</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round(stats?.totalCalories || 0)}
            </Text>
            <Text style={styles.statLabel}>Calories Burned</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round((stats?.totalDuration || 0) / 60)}
            </Text>
            <Text style={styles.statLabel}>Minutes Active</Text>
          </View>
        </View>
      </View>

      <View style={styles.exerciseStats}>
        <Text style={styles.sectionTitle}>Exercise Breakdown</Text>
        
        {stats?.exerciseBreakdown && Object.keys(stats.exerciseBreakdown).length > 0 ? (
          Object.entries(stats.exerciseBreakdown).map(([exercise, data]) => (
            <View key={exercise} style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>
                {exercise.charAt(0).toUpperCase() + exercise.slice(1)}
              </Text>
              <View style={styles.exerciseDetails}>
                <Text style={styles.exerciseDetailText}>
                  {data.count} workouts
                </Text>
                <Text style={styles.exerciseDetailText}>
                  {data.totalReps} reps
                </Text>
                <Text style={styles.exerciseDetailText}>
                  {Math.round(data.totalCalories)} cal
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No workout data yet. Start your first workout!</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subGreeting: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
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
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  exerciseStats: {
    padding: 20,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseDetailText: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
});
