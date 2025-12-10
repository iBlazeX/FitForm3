import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/workout.dart';
import 'package:intl/intl.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<Workout> _workouts = [];
  bool _isLoading = true;
  String? _filterExercise;

  @override
  void initState() {
    super.initState();
    _loadWorkouts();
  }

  Future<void> _loadWorkouts() async {
    setState(() => _isLoading = true);
    
    final workoutsData = await ApiService.getWorkoutHistory(
      exerciseType: _filterExercise,
    );
    
    setState(() {
      _workouts = workoutsData.map((w) => Workout.fromJson(w)).toList();
      _isLoading = false;
    });
  }

  Future<void> _deleteWorkout(String workoutId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Workout'),
        content: const Text('Are you sure you want to delete this workout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final success = await ApiService.deleteWorkout(workoutId);
      if (success) {
        _loadWorkouts();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Workout deleted')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Workout History'),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.filter_list),
            onSelected: (value) {
              setState(() {
                _filterExercise = value == 'all' ? null : value;
              });
              _loadWorkouts();
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'all', child: Text('All Exercises')),
              const PopupMenuItem(value: 'pushup', child: Text('Push-ups')),
              const PopupMenuItem(value: 'squat', child: Text('Squats')),
              const PopupMenuItem(value: 'situp', child: Text('Sit-ups')),
            ],
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _workouts.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.history,
                        size: 64,
                        color: Colors.grey[400],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No workout history yet',
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () => Navigator.pushNamed(context, '/workout'),
                        child: const Text('Start Your First Workout'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadWorkouts,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _workouts.length,
                    itemBuilder: (context, index) {
                      final workout = _workouts[index];
                      return _WorkoutCard(
                        workout: workout,
                        onDelete: () => _deleteWorkout(workout.id!),
                      );
                    },
                  ),
                ),
    );
  }
}

class _WorkoutCard extends StatelessWidget {
  final Workout workout;
  final VoidCallback onDelete;

  const _WorkoutCard({
    required this.workout,
    required this.onDelete,
  });

  IconData _getExerciseIcon(String exerciseType) {
    switch (exerciseType.toLowerCase()) {
      case 'pushup':
        return Icons.fitness_center;
      case 'squat':
        return Icons.accessibility_new;
      case 'situp':
        return Icons.airline_seat_recline_normal;
      default:
        return Icons.directions_run;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primaryContainer,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            _getExerciseIcon(workout.exerciseType),
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        title: Text(
          workout.exerciseDisplayName,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.repeat, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text('${workout.reps} reps'),
                const SizedBox(width: 16),
                Icon(Icons.local_fire_department, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text('${workout.caloriesBurned.toStringAsFixed(1)} kcal'),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.timer, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text(workout.durationFormatted),
                const SizedBox(width: 16),
                Icon(Icons.calendar_today, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text(DateFormat('MMM dd, yyyy').format(workout.date)),
              ],
            ),
          ],
        ),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline, color: Colors.red),
          onPressed: onDelete,
        ),
      ),
    );
  }
}
