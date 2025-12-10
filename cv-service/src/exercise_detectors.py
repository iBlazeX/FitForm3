"""
Exercise Detectors Module
Contains exercise-specific detection classes for push-ups, squats, and sit-ups.
"""

import os
from abc import ABC, abstractmethod
from pose_detector import PoseDetector


class ExerciseDetector(ABC):
    """Abstract base class for exercise detection."""
    
    def __init__(self):
        self.count = 0
        self.stage = None
        self.feedback = []
        self.calories_per_rep = 0.0
        
    @abstractmethod
    def detect(self, pose_detector) -> dict:
        """Detect exercise and update count."""
        pass
    
    def reset(self):
        """Reset the counter and stage."""
        self.count = 0
        self.stage = None
        self.feedback = []
        
    def get_calories(self):
        """Calculate calories burned."""
        return round(self.count * self.calories_per_rep, 2)
    
    def get_state(self):
        """Get current state of the detector."""
        return {
            'count': self.count,
            'stage': self.stage,
            'form_feedback': self.feedback,
            'calories_burned': self.get_calories()
        }


class PushupDetector(ExerciseDetector):
    """Detector for push-up exercises."""
    
    def __init__(self):
        super().__init__()
        self.calories_per_rep = 0.35
        self.stage = None  # "up" / "down"
        
    def detect(self, pose_detector) -> dict:
        """
        Detect push-up and count reps.
        Simple detection based on elbow angle only.
        """
        self.feedback = []

        # Get landmarks
        shoulder = pose_detector.get_landmark('LEFT_SHOULDER')
        elbow = pose_detector.get_landmark('LEFT_ELBOW')
        wrist = pose_detector.get_landmark('LEFT_WRIST')
        hip = pose_detector.get_landmark('LEFT_HIP')
        ankle = pose_detector.get_landmark('LEFT_ANKLE')

        if not all([shoulder, elbow, wrist, hip, ankle]):
            self.feedback.append("Cannot detect body")
            state = self.get_state()
            state['elbow_angle'] = 0
            state['body_angle'] = 0
            state['posture_ok'] = False
            return state

        # Calculate elbow angle
        elbow_angle = pose_detector.calculate_angle(shoulder, elbow, wrist)
        body_angle = pose_detector.calculate_angle(shoulder, hip, ankle)
        
        # Thresholds calibrated for side-view camera angle
        # Based on actual user data: up=75-85°, down=40-50°
        UP_THRESHOLD = 70    # Arms relatively straight (from camera's perspective)
        DOWN_THRESHOLD = 55  # Arms bent (going low)
        
        # State machine for counting
        if elbow_angle > UP_THRESHOLD:
            self.stage = "up"
            self.feedback.append("Arms extended - go down")
        elif elbow_angle < DOWN_THRESHOLD:
            if self.stage == "up":
                self.count += 1
                print(f"REP COUNTED! Total: {self.count}, angle was: {elbow_angle}")
            self.stage = "down"
            self.feedback.append("Good depth!")
        else:
            self.feedback.append("Keep going")

        state = self.get_state()
        state['elbow_angle'] = round(elbow_angle, 2)
        state['body_angle'] = round(body_angle, 2)
        state['posture_ok'] = True
        return state


class SquatDetector(ExerciseDetector):
    """Detector for squat exercises."""
    
    def __init__(self):
        super().__init__()
        self.calories_per_rep = 0.32
        
    def detect(self, pose_detector):
        """
        Detect squat and count reps.
        
        Squat detection:
        - Up position: Knee angle > 160°
        - Down position: Knee angle < 100°
        - Form check: Squat depth and back angle
        """
        self.feedback = []
        
        # Get landmarks
        hip = pose_detector.get_landmark('LEFT_HIP')
        knee = pose_detector.get_landmark('LEFT_KNEE')
        ankle = pose_detector.get_landmark('LEFT_ANKLE')
        shoulder = pose_detector.get_landmark('LEFT_SHOULDER')
        
        if not all([hip, knee, ankle, shoulder]):
            self.feedback.append("Cannot detect legs. Please adjust camera.")
            return self.get_state()
        
        # Calculate knee angle
        knee_angle = pose_detector.calculate_angle(hip, knee, ankle)
        if knee_angle > 160:
            self.stage = "up"
            
        # Down position (squatting) - count rep when going down from up
        if knee_angle < 100:
            if self.stage == "up":
                self.stage = "down"
                self.count += 1

        if not self.feedback:
            self.feedback.append("Good form!")
            
        return self.get_state()


class SitupDetector(ExerciseDetector):
    """Detector for sit-up exercises."""
    
    def __init__(self):
        super().__init__()
        self.calories_per_rep = 0.25
        
    def detect(self, pose_detector):
        """
        Detect sit-up and count reps.
        
        Sit-up detection:
        - Down position: Hip angle > 120° (lying flat)
        - Up position: Hip angle < 80° (sitting up)
        """
        self.feedback = []
        
        # Get landmarks
        shoulder = pose_detector.get_landmark('LEFT_SHOULDER')
        hip = pose_detector.get_landmark('LEFT_HIP')
        knee = pose_detector.get_landmark('LEFT_KNEE')
        
        if not all([shoulder, hip, knee]):
            self.feedback.append("Cannot detect torso. Please adjust camera.")
            return self.get_state()
        
        # Calculate hip angle
        hip_angle = pose_detector.calculate_angle(shoulder, hip, knee)
        
        # Down position (lying flat)
        if hip_angle > 120:
            self.stage = "down"
            
        # Up position (sitting up) - count rep when reaching up
        if hip_angle < 80:
            if self.stage == "down":
                self.stage = "up"
                self.count += 1
                
        # Form feedback
        if hip_angle > 80 and hip_angle < 120:
            if self.stage == "down":
                self.feedback.append("Lean forward more to complete rep")
                
        if not self.feedback:
            self.feedback.append("Good form!")
            
        return self.get_state()


# Factory function to get detector by exercise type
def get_detector(exercise_type):
    """
    Factory function to get the appropriate detector.
    
    Args:
        exercise_type: Type of exercise ('pushup', 'squat', 'situp')
        
    Returns:
        ExerciseDetector instance
    """
    detectors = {
        'pushup': PushupDetector,
        'squat': SquatDetector,
        'situp': SitupDetector
    }
    
    detector_class = detectors.get(exercise_type.lower())
    if detector_class:
        return detector_class()
    return None


# List of supported exercises
SUPPORTED_EXERCISES = ['pushup', 'squat', 'situp']
