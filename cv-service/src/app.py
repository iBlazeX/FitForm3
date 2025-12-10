"""
FitForm CV Service
Flask REST API for exercise detection using computer vision.
"""

import os
import warnings

# Suppress MediaPipe GPU warnings (we use CPU mode in Docker)
os.environ["MEDIAPIPE_DISABLE_GPU"] = "1"
os.environ["GLOG_minloglevel"] = "2"  # Suppress absl/glog messages
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  # Suppress TensorFlow messages

# Suppress Flask-Limiter in-memory storage warning (acceptable for dev)
warnings.filterwarnings("ignore", message="Using the in-memory storage")

import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from pose_detector import PoseDetector
from exercise_detectors import get_detector, SUPPORTED_EXERCISES

app = Flask(__name__)
CORS(app)

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["20000 per day", "5000 per hour"]
)

# Initialize pose detector
pose_detector = PoseDetector()

# Store exercise detectors per session (in production, use Redis or similar)
exercise_detectors = {}


def decode_image(base64_string):
    """Decode base64 string to OpenCV image."""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
            
        # Decode base64
        img_bytes = base64.b64decode(base64_string)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        return image
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'cv-service',
        'version': '1.0.0'
    })


@app.route('/api/exercises', methods=['GET'])
def get_exercises():
    """Get list of supported exercises."""
    return jsonify({
        'exercises': SUPPORTED_EXERCISES,
        'details': {
            'pushup': {
                'name': 'Push-up',
                'calories_per_rep': 0.35,
                'description': 'Upper body exercise targeting chest, shoulders, and triceps'
            },
            'squat': {
                'name': 'Squat',
                'calories_per_rep': 0.32,
                'description': 'Lower body exercise targeting quadriceps, hamstrings, and glutes'
            },
            'situp': {
                'name': 'Sit-up',
                'calories_per_rep': 0.25,
                'description': 'Core exercise targeting abdominal muscles'
            }
        }
    })


@app.route('/api/detect', methods=['POST'])
@limiter.limit("6000 per minute")
def detect_exercise():
    """
    Detect exercise from image and count reps.
    
    Request body:
    {
        "image": "base64_encoded_image",
        "exercise_type": "pushup|squat|situp",
        "session_id": "optional_session_identifier"
    }
    
    Response:
    {
        "count": 10,
        "stage": "up",
        "form_feedback": ["Good form!"],
        "calories_burned": 3.5,
        "landmarks_detected": true
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
        
    # Validate image
    image_data = data.get('image')
    if not image_data:
        return jsonify({'error': 'No image provided'}), 400
        
    # Validate exercise type
    exercise_type = data.get('exercise_type', 'pushup').lower()
    if exercise_type not in SUPPORTED_EXERCISES:
        return jsonify({
            'error': f'Unsupported exercise type. Supported: {SUPPORTED_EXERCISES}'
        }), 400
        
    # Session ID for tracking state
    session_id = data.get('session_id', 'default')
    detector_key = f"{session_id}_{exercise_type}"
    
    # Get or create detector
    if detector_key not in exercise_detectors:
        exercise_detectors[detector_key] = get_detector(exercise_type)
        
    detector = exercise_detectors[detector_key]
    
    # Decode image
    image = decode_image(image_data)
    if image is None:
        return jsonify({'error': 'Invalid image data'}), 400
        
    # Detect pose
    results = pose_detector.detect(image)
    landmarks_detected = pose_detector.landmarks_detected()
    
    # Detect exercise if landmarks found
    if landmarks_detected:
        state = detector.detect(pose_detector)
        print(f"[DEBUG] key={detector_key}, count={state.get('count')}, stage={state.get('stage')}, elbow={state.get('elbow_angle')}")
    else:
        state = detector.get_state()
        state['form_feedback'] = ['No person detected. Please step into frame.']
        print(f"[DEBUG] key={detector_key}, NO LANDMARKS, count={state.get('count')}")
        
    state['landmarks_detected'] = landmarks_detected

    # Optional annotated image return (draw landmarks like MediaPipe demo)
    if data.get('return_image', False) and results is not None:
        annotated = pose_detector.draw_landmarks(image.copy(), results)
        success, buffer = cv2.imencode('.jpg', annotated)
        if success:
            encoded = base64.b64encode(buffer).decode('utf-8')
            state['annotated_image'] = f"data:image/jpeg;base64,{encoded}"
    
    return jsonify(state)


@app.route('/api/reset', methods=['POST'])
@limiter.limit("10 per minute")
def reset_counter():
    """
    Reset the rep counter for a specific exercise.
    
    Request body:
    {
        "exercise_type": "pushup|squat|situp",
        "session_id": "optional_session_identifier"
    }
    """
    data = request.get_json() or {}
    
    exercise_type = data.get('exercise_type', 'pushup').lower()
    session_id = data.get('session_id', 'default')
    detector_key = f"{session_id}_{exercise_type}"
    
    # Delete old session and create fresh detector
    if detector_key in exercise_detectors:
        del exercise_detectors[detector_key]
    
    # Create a fresh detector for this session
    exercise_detectors[detector_key] = get_detector(exercise_type)
        
    return jsonify({
        'message': 'Counter reset',
        'exercise_type': exercise_type,
        'session_id': session_id
    })


@app.route('/api/cleanup', methods=['POST'])
@limiter.limit("10 per minute")
def cleanup_sessions():
    """
    Clean up old sessions to free memory.
    Call this when ending a workout.
    
    Request body:
    {
        "session_id": "session_to_cleanup"
    }
    """
    data = request.get_json() or {}
    session_id = data.get('session_id')
    
    if not session_id:
        return jsonify({'error': 'session_id required'}), 400
    
    # Remove all detectors for this session
    keys_to_remove = [k for k in exercise_detectors.keys() if k.startswith(session_id)]
    for key in keys_to_remove:
        del exercise_detectors[key]
    
    return jsonify({
        'message': 'Session cleaned up',
        'removed': len(keys_to_remove)
    })


@app.route('/api/state', methods=['GET'])
def get_state():
    """
    Get current state of all detectors.
    Useful for debugging.
    """
    states = {}
    for key, detector in exercise_detectors.items():
        states[key] = detector.get_state()
    return jsonify(states)


# Error handlers
@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': str(e.description)
    }), 429


@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
