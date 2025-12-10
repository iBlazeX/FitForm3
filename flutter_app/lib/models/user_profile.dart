class UserProfile {
  final String id;
  final String username;
  final String email;
  final int? age;
  final double? weight;
  final double? height;
  final String? gender;
  final String? fitnessGoal;
  final DateTime createdAt;

  UserProfile({
    required this.id,
    required this.username,
    required this.email,
    this.age,
    this.weight,
    this.height,
    this.gender,
    this.fitnessGoal,
    required this.createdAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] ?? '',
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      age: json['profile']?['age'],
      weight: json['profile']?['weight']?.toDouble(),
      height: json['profile']?['height']?.toDouble(),
      gender: json['profile']?['gender'],
      fitnessGoal: json['profile']?['fitnessGoal'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'profile': {
        'age': age,
        'weight': weight,
        'height': height,
        'gender': gender,
        'fitnessGoal': fitnessGoal,
      },
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
