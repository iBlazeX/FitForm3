import cv2
import mediapipe as mp
import numpy as np

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose


def calculate_angle(a, b, c):
    a = np.array(a)  # First
    b = np.array(b)  # Mid
    c = np.array(c)  # End

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
    stage = None      # "up" / "down"
    form_label = ""   # Good / Decent / Bad

    with mp_pose.Pose(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as pose:

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Recolor image to RGB
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False

            # Detection
            results = pose.process(image)

            # Back to BGR
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            try:
                landmarks = results.pose_landmarks.landmark

                # Use LEFT side for side-view push-ups
                shoulder = [
                    landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y,
                ]
                elbow = [
                    landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y,
                ]
                wrist = [
                    landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y,
                ]
                hip = [
                    landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y,
                ]
                ankle = [
                    landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y,
                ]

                # Angles
                elbow_angle = calculate_angle(shoulder, elbow, wrist)      # arm
                body_angle = calculate_angle(shoulder, hip, ankle)        # body line

                # Visualize elbow angle
                cv2.putText(
                    image,
                    str(int(elbow_angle)),
                    tuple(np.multiply(elbow, [640, 480]).astype(int)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (255, 255, 255),
                    2,
                    cv2.LINE_AA,
                )

                # Basic posture gating: require plank‑like body and low position
                shoulder_y = shoulder[1]
                hip_y = hip[1]

                plank_like = 150 <= body_angle <= 210      # roughly straight line
                low_enough = (hip_y > 0.4 and shoulder_y > 0.3)

                posture_ok = plank_like and low_enough

                # Push‑up counter logic (only when posture is OK)
                if posture_ok:
                    # Top position (arms extended)
                    if elbow_angle > 150:
                        stage = "up"
                    # Bottom position (arms bent) → count only from "up"
                    if elbow_angle < 90 and stage == "up":
                        stage = "down"
                        counter += 1
                        print("Reps:", counter)

                    # Form quality evaluation
                    # Good: body straight and elbow range full
                    if plank_like and elbow_angle < 70:
                        form_label = "Good form"
                    elif plank_like:
                        form_label = "Decent form"
                    else:
                        form_label = "Bad form"
                else:
                    form_label = "Bad form"

            except Exception:
                # No landmarks detected
                pass

            # UI: top-left stats box
            cv2.rectangle(image, (0, 0), (260, 110), (245, 117, 16), -1)

            # Reps
            cv2.putText(
                image,
                "REPS",
                (15, 20),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 0, 0),
                1,
                cv2.LINE_AA,
            )
            cv2.putText(
                image,
                str(counter),
                (15, 70),
                cv2.FONT_HERSHEY_SIMPLEX,
                2,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )

            # Stage
            cv2.putText(
                image,
                "STAGE",
                (110, 20),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 0, 0),
                1,
                cv2.LINE_AA,
            )
            cv2.putText(
                image,
                stage if stage is not None else "",
                (110, 70),
                cv2.FONT_HERSHEY_SIMPLEX,
                2,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )

            # Form feedback
            color = (0, 255, 0) if form_label == "Good form" else (0, 255, 255) if form_label == "Decent form" else (0, 0, 255)
            cv2.putText(
                image,
                form_label,
                (15, 105),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                color,
                2,
                cv2.LINE_AA,
            )

            # Draw pose
            mp_drawing.draw_landmarks(
                image,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(
                    color=(245, 117, 66), thickness=2, circle_radius=2
                ),
                mp_drawing.DrawingSpec(
                    color=(245, 66, 230), thickness=2, circle_radius=2
                ),
            )

            cv2.imshow("Push-up Counter", image)

            if cv2.waitKey(10) & 0xFF == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
