import 'package:flutter/material.dart';
import 'dart:async';

class WorkoutScreen extends StatefulWidget {
  const WorkoutScreen({super.key});

  @override
  State<WorkoutScreen> createState() => _WorkoutScreenState();
}

class _WorkoutScreenState extends State<WorkoutScreen> {
  String _selectedExercise = 'pushup';
  bool _isWorkoutActive = false;
  int _repCount = 0;
  int _seconds = 0;
  Timer? _timer;
  double _calories = 0.0;

  final List<Map<String, dynamic>> _exercises = [
    {'value': 'pushup', 'label': 'Push-ups', 'icon': Icons.fitness_center},
    {'value': 'squat', 'label': 'Squats', 'icon': Icons.accessibility_new},
    {'value': 'situp', 'label': 'Sit-ups', 'icon': Icons.airline_seat_recline_normal},
  ];

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startWorkout() {
    setState(() {
      _isWorkoutActive = true;
      _repCount = 0;
      _seconds = 0;
      _calories = 0.0;
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _seconds++;
      });
    });
  }

  void _stopWorkout() {
    _timer?.cancel();
    setState(() {
      _isWorkoutActive = false;
    });

    // Show summary dialog
    _showWorkoutSummary();
  }

  void _simulateRep() {
    if (_isWorkoutActive) {
      setState(() {
        _repCount++;
        // Rough calorie calculation
        _calories += _selectedExercise == 'pushup' ? 0.35 : 0.32;
      });
    }
  }

  void _showWorkoutSummary() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Workout Complete!'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Exercise: ${_exercises.firstWhere((e) => e['value'] == _selectedExercise)['label']}'),
            const SizedBox(height: 8),
            Text('Reps: $_repCount'),
            Text('Duration: ${_formatDuration(_seconds)}'),
            Text('Calories: ${_calories.toStringAsFixed(1)} kcal'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  String _formatDuration(int seconds) {
    final minutes = seconds ~/ 60;
    final secs = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Workout'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Exercise Selection
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Select Exercise',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _selectedExercise,
                      decoration: InputDecoration(
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      items: _exercises.map((exercise) {
                        return DropdownMenuItem(
                          value: exercise['value'],
                          child: Row(
                            children: [
                              Icon(exercise['icon']),
                              const SizedBox(width: 12),
                              Text(exercise['label']),
                            ],
                          ),
                        );
                      }).toList(),
                      onChanged: _isWorkoutActive
                          ? null
                          : (value) {
                              setState(() {
                                _selectedExercise = value!;
                              });
                            },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Camera Preview Placeholder
            Card(
              child: Container(
                height: 300,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.videocam_outlined,
                        size: 64,
                        color: Colors.grey[400],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Camera Preview',
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Real-time pose detection will appear here',
                        style: TextStyle(
                          color: Colors.grey[500],
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Workout Stats
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _WorkoutStat(
                          label: 'Reps',
                          value: _repCount.toString(),
                          icon: Icons.repeat,
                        ),
                        _WorkoutStat(
                          label: 'Time',
                          value: _formatDuration(_seconds),
                          icon: Icons.timer,
                        ),
                        _WorkoutStat(
                          label: 'Calories',
                          value: _calories.toStringAsFixed(1),
                          icon: Icons.local_fire_department,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Control Buttons
            if (!_isWorkoutActive) ...[
              ElevatedButton.icon(
                onPressed: _startWorkout,
                icon: const Icon(Icons.play_arrow),
                label: const Text('Start Workout'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ] else ...[
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _simulateRep,
                      icon: const Icon(Icons.add),
                      label: const Text('Add Rep'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _stopWorkout,
                      icon: const Icon(Icons.stop),
                      label: const Text('Stop'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 16),
            Text(
              'Note: This is a demo version. Camera integration with CV service will be added in production.',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 12,
                fontStyle: FontStyle.italic,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _WorkoutStat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _WorkoutStat({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: Theme.of(context).colorScheme.primary),
        const SizedBox(height: 8),
        Text(
          value,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        Text(
          label,
          style: TextStyle(
            color: Colors.grey[600],
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}
