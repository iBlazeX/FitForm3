import 'dart:convert';
import 'dart:developer' as developer;
import 'package:http/http.dart' as http;

class ApiService {
  // TODO: Replace with your backend URL
  static const String baseUrl = 'http://localhost:3000/api';
  static const String cvServiceUrl = 'http://localhost:5000/api';

  static String? _authToken;

  static void setAuthToken(String? token) {
    _authToken = token;
  }

  static Map<String, String> _getHeaders({bool includeAuth = true}) {
    final headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth && _authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    
    return headers;
  }

  // User Profile
  static Future<Map<String, dynamic>?> getUserProfile() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/auth/profile'),
        headers: _getHeaders(),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return null;
    } catch (e) {
      developer.log('Error getting user profile', error: e, name: 'ApiService');
      return null;
    }
  }

  static Future<bool> updateUserProfile(Map<String, dynamic> profile) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/auth/profile'),
        headers: _getHeaders(),
        body: json.encode(profile),
      );

      return response.statusCode == 200;
    } catch (e) {
      developer.log('Error updating user profile', error: e, name: 'ApiService');
      return false;
    }
  }

  // Workouts
  static Future<bool> saveWorkout(Map<String, dynamic> workout) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/workouts'),
        headers: _getHeaders(),
        body: json.encode(workout),
      );

      return response.statusCode == 201;
    } catch (e) {
      developer.log('Error saving workout', error: e, name: 'ApiService');
      return false;
    }
  }

  static Future<List<Map<String, dynamic>>> getWorkoutHistory({
    int limit = 50,
    int skip = 0,
    String? exerciseType,
  }) async {
    try {
      var uri = Uri.parse('$baseUrl/workouts/history?limit=$limit&skip=$skip');
      if (exerciseType != null) {
        uri = Uri.parse('${uri.toString()}&exerciseType=$exerciseType');
      }

      final response = await http.get(uri, headers: _getHeaders());

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<Map<String, dynamic>>.from(data['workouts'] ?? []);
      }
      return [];
    } catch (e) {
      developer.log('Error getting workout history', error: e, name: 'ApiService');
      return [];
    }
  }

  static Future<Map<String, dynamic>?> getWorkoutStats({int period = 30}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/workouts/stats?period=$period'),
        headers: _getHeaders(),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return null;
    } catch (e) {
      developer.log('Error getting workout stats', error: e, name: 'ApiService');
      return null;
    }
  }

  static Future<bool> deleteWorkout(String workoutId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/workouts/$workoutId'),
        headers: _getHeaders(),
      );

      return response.statusCode == 200;
    } catch (e) {
      developer.log('Error deleting workout', error: e, name: 'ApiService');
      return false;
    }
  }

  // CV Service
  static Future<Map<String, dynamic>?> detectExercise({
    required String imageBase64,
    required String exerciseType,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$cvServiceUrl/detect'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'image': imageBase64,
          'exercise_type': exerciseType,
        }),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return null;
    } catch (e) {
      developer.log('Error detecting exercise', error: e, name: 'ApiService');
      return null;
    }
  }

  static Future<bool> resetExerciseCounter(String exerciseType) async {
    try {
      final response = await http.post(
        Uri.parse('$cvServiceUrl/reset'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'exercise_type': exerciseType}),
      );

      return response.statusCode == 200;
    } catch (e) {
      developer.log('Error resetting counter', error: e, name: 'ApiService');
      return false;
    }
  }

  static Future<List<String>> getSupportedExercises() async {
    try {
      final response = await http.get(
        Uri.parse('$cvServiceUrl/exercises'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<String>.from(data['exercises'] ?? []);
      }
      return [];
    } catch (e) {
      developer.log('Error getting supported exercises', error: e, name: 'ApiService');
      return [];
    }
  }
}
