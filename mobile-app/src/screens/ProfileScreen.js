/**
 * Profile Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function ProfileScreen() {
  const [profile, setProfile] = useState({
    username: '',
    email: auth.currentUser?.email || '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    fitnessGoal: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile({
          username: data.username || '',
          email: user.email || '',
          age: data.profile?.age?.toString() || '',
          weight: data.profile?.weight?.toString() || '',
          height: data.profile?.height?.toString() || '',
          gender: data.profile?.gender || '',
          fitnessGoal: data.profile?.fitnessGoal || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'Not logged in');
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        username: profile.username,
        profile: {
          age: profile.age ? parseInt(profile.age) : null,
          weight: profile.weight ? parseFloat(profile.weight) : null,
          height: profile.height ? parseFloat(profile.height) : null,
          gender: profile.gender || null,
          fitnessGoal: profile.fitnessGoal || null
        }
      }, { merge: true });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.username ? profile.username[0].toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={profile.username}
            onChangeText={(text) => setProfile({...profile, username: text})}
            placeholder="Enter username"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={profile.age}
              onChangeText={(text) => setProfile({...profile, age: text})}
              placeholder="Age"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Gender</Text>
            <TextInput
              style={styles.input}
              value={profile.gender}
              onChangeText={(text) => setProfile({...profile, gender: text})}
              placeholder="male/female/other"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={profile.weight}
              onChangeText={(text) => setProfile({...profile, weight: text})}
              placeholder="Weight"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={profile.height}
              onChangeText={(text) => setProfile({...profile, height: text})}
              placeholder="Height"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fitness Goal</Text>
          <TextInput
            style={styles.input}
            value={profile.fitnessGoal}
            onChangeText={(text) => setProfile({...profile, fitnessGoal: text})}
            placeholder="e.g., lose_weight, build_muscle, stay_active"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    marginBottom: 16
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold'
  },
  email: {
    color: '#6B7280',
    fontSize: 14
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16
  },
  inputGroup: {
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  halfWidth: {
    flex: 1
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937'
  },
  saveBtn: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 16,
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
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 40,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444'
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600'
  }
});
