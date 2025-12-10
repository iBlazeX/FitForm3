"""
Pose Detector Module
Uses MediaPipe for human pose detection and landmark extraction.
"""

import os

# Disable GPU for MediaPipe - must be set before importing mediapipe
os.environ["MEDIAPIPE_DISABLE_GPU"] = "1"
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["GLOG_minloglevel"] = "2"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import mediapipe as mp
import numpy as np
import cv2


class PoseDetector:
    """
    A wrapper class for MediaPipe Pose detection.
    Provides methods for detecting pose landmarks and calculating angles.
    """
    
    def __init__(self, min_detection_confidence=0.3, min_tracking_confidence=0.3):
        """
        Initialize the PoseDetector.
        
        Args:
            min_detection_confidence: Minimum confidence for detection (0.0-1.0)
            min_tracking_confidence: Minimum confidence for tracking (0.0-1.0)
        """
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        self.landmarks = None
        
    def detect(self, image):
        """
        Detect pose in the given image.
        
        Args:
            image: BGR image (numpy array)
            
        Returns:
            results: MediaPipe pose detection results
        """
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image_rgb.flags.writeable = False
        
        # Process the image
        results = self.pose.process(image_rgb)
        
        if results.pose_landmarks:
            self.landmarks = results.pose_landmarks.landmark
        else:
            self.landmarks = None
            
        return results
    
    def get_landmark(self, landmark_name, visibility_threshold=0.5):
        """
        Get a specific landmark position with visibility check and left/right fallback.

        Args:
            landmark_name: The name of the landmark (e.g., 'LEFT_SHOULDER')
            visibility_threshold: Minimum visibility required to trust the point
            
        Returns:
            tuple: (x, y) coordinates or None if not found/visible
        """
        if self.landmarks is None:
            return None

        def _get(name):
            try:
                enum_val = getattr(self.mp_pose.PoseLandmark, name)
                lm = self.landmarks[enum_val.value]
                if lm.visibility < visibility_threshold:
                    return None
                return (lm.x, lm.y)
            except (AttributeError, IndexError):
                return None

        # Try requested side first
        point = _get(landmark_name)
        if point is not None:
            return point

        # Fallback to opposite side if available (helps when camera mirrors)
        if landmark_name.startswith('LEFT_'):
            alt_name = landmark_name.replace('LEFT_', 'RIGHT_', 1)
            return _get(alt_name)
        if landmark_name.startswith('RIGHT_'):
            alt_name = landmark_name.replace('RIGHT_', 'LEFT_', 1)
            return _get(alt_name)
        return None
    
    @staticmethod
    def calculate_angle(a, b, c):
        """Calculate the angle at point b (in degrees) formed by points a-b-c.

        Uses arctan2 method matching the working reference implementation.
        """
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)

        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(
            a[1] - b[1], a[0] - b[0]
        )
        angle = np.abs(radians * 180.0 / np.pi)

        if angle > 180.0:
            angle = 360 - angle

        return angle
    
    def draw_landmarks(self, image, results):
        """
        Draw pose landmarks on the image.
        
        Args:
            image: BGR image to draw on
            results: MediaPipe pose detection results
            
        Returns:
            image: Image with landmarks drawn
        """
        if results.pose_landmarks:
            # Draw skeleton with bright, visible colors
            # Landmarks (joints): bright green circles
            # Connections (bones): bright magenta/pink lines
            self.mp_drawing.draw_landmarks(
                image,
                results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS,
                self.mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=3, circle_radius=5),
                self.mp_drawing.DrawingSpec(color=(255, 0, 255), thickness=3, circle_radius=3)
            )
        return image
    
    def landmarks_detected(self):
        """Check if landmarks were detected in the last frame."""
        return self.landmarks is not None
