class Workout {
  final String? id;
  final String userId;
  final String exerciseType;
  final int reps;
  final double caloriesBurned;
  final int duration; // in seconds
  final List<String> formFeedback;
  final DateTime date;

  Workout({
    this.id,
    required this.userId,
    required this.exerciseType,
    required this.reps,
    required this.caloriesBurned,
    required this.duration,
    required this.formFeedback,
    required this.date,
  });

  factory Workout.fromJson(Map<String, dynamic> json) {
    return Workout(
      id: json['id'],
      userId: json['userId'] ?? '',
      exerciseType: json['exerciseType'] ?? '',
      reps: json['reps'] ?? 0,
      caloriesBurned: (json['caloriesBurned'] ?? 0).toDouble(),
      duration: json['duration'] ?? 0,
      formFeedback: List<String>.from(json['formFeedback'] ?? []),
      date: DateTime.parse(json['date'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'userId': userId,
      'exerciseType': exerciseType,
      'reps': reps,
      'caloriesBurned': caloriesBurned,
      'duration': duration,
      'formFeedback': formFeedback,
      'date': date.toIso8601String(),
    };
  }

  String get exerciseDisplayName {
    switch (exerciseType.toLowerCase()) {
      case 'pushup':
        return 'Push-ups';
      case 'squat':
        return 'Squats';
      case 'situp':
        return 'Sit-ups';
      default:
        return exerciseType;
    }
  }

  String get durationFormatted {
    final minutes = duration ~/ 60;
    final seconds = duration % 60;
    return '${minutes}m ${seconds}s';
  }
}
