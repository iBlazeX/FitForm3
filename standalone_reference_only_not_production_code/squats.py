import cv2
import mediapipe as mp
import numpy as np

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose


def calculate_angle(a, b, c):
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


def main():
    cap = cv2.VideoCapture(0)

    counter = 0
    stage = "up"        # "up" (standing) / "down" (in squat)
    form_label = "Go down"   # what to show under the box

    with mp_pose.Pose(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as pose:

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = pose.process(image)

            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            try:
                landmarks = results.pose_landmarks.landmark

                # LEFT side for squat analysis
                hip = [
                    landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y,
                ]
                knee = [
                    landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y,
                ]
                ankle = [
                    landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y,
                ]
                shoulder = [
                    landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y,
                ]

                # RIGHT side for reset gesture (hand above head)
                right_shoulder = [
                    landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                    landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y,
                ]
                right_wrist = [
                    landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                    landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y,
                ]

                # Angles
                knee_angle = calculate_angle(hip, knee, ankle)
                back_angle = calculate_angle(shoulder, hip, knee)

                # Visualize knee angle
                cv2.putText(
                    image,
                    str(int(knee_angle)),
                    tuple(np.multiply(knee, [640, 480]).astype(int)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (255, 255, 255),
                    2,
                    cv2.LINE_AA,
                )

                # ----- Counter reset gesture: raise right hand above head -----
                # y is 0 at top, 1 at bottom
                if right_wrist[1] + 0.03 < right_shoulder[1]:
                    counter = 0
                    stage = "up"
                    form_label = "Counter reset"

                # ----- Squat logic -----
                # Standing: knee_angle > 165
                # Bottom:   knee_angle < 90
                # Only check form while "down"; while "up", show "Go down"
                if knee_angle > 165:
                    stage = "up"
                    form_label = "Go down"
                elif knee_angle < 90 and stage == "up":
                    stage = "down"
                    counter += 1

                # Only evaluate form when actually in squat ("down")
                if stage == "down":
                    # Basic posture filters
                    hip_y = hip[1]
                    shoulder_y = shoulder[1]
                    low_enough = hip_y > 0.5
                    torso_upright_enough = back_angle > 40

                    if low_enough and torso_upright_enough:
                        # Good form: decent depth & neutral-ish back
                        if 80 <= knee_angle <= 110 and 60 <= back_angle <= 100:
                            form_label = "Good form"
                        elif 70 <= knee_angle <= 120:
                            form_label = "Decent form"
                        else:
                            form_label = "Bad form"
                    else:
                        form_label = "Bad form"

            except Exception:
                pass

            # UI box
            cv2.rectangle(image, (0, 0), (300, 120), (245, 117, 16), -1)

            # Title
            cv2.putText(
                image, "SQUATS", (15, 20),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1, cv2.LINE_AA
            )

            # Reps
            cv2.putText(
                image, "REPS", (15, 45),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA
            )
            cv2.putText(
                image, str(counter), (15, 90),
                cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 2, cv2.LINE_AA
            )

            # Stage
            cv2.putText(
                image, "STAGE", (120, 45),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA
            )
            cv2.putText(
                image, stage if stage is not None else "", (120, 90),
                cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 2, cv2.LINE_AA
            )

            # Form feedback / hint
            color = (
                (0, 255, 0) if form_label == "Good form"
                else (0, 255, 255) if form_label == "Decent form"
                else (0, 0, 255)
            )
            cv2.putText(
                image, form_label, (15, 115),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2, cv2.LINE_AA
            )

            # Draw pose
            mp_drawing.draw_landmarks(
                image,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=2),
                mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2),
            )

            cv2.imshow("Squat Counter", image)

            if cv2.waitKey(10) & 0xFF == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
