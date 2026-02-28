import math

import numpy as np

from app.models.landmarks import LandmarkFrame
from app.models.signals import SignalSnapshot
from app.services.rolling_window import RollingWindow


class SignalProcessor:
    def __init__(self, window_size: int = 30):
        self.window = RollingWindow(window_size)

    def process(self, frame: LandmarkFrame) -> SignalSnapshot:
        eye_contact = self._compute_eye_contact(frame.face_landmarks)
        head_yaw, head_pitch, head_roll = self._compute_head_pose(
            frame.face_landmarks
        )
        mouth_ratio = self._compute_mouth_open(frame.face_landmarks)
        sentiment = self._compute_sentiment(frame.face_landmarks)

        snapshot = SignalSnapshot(
            timestamp=frame.timestamp,
            eye_contact_score=eye_contact,
            head_yaw=head_yaw,
            head_pitch=head_pitch,
            head_roll=head_roll,
            mouth_open_ratio=mouth_ratio,
            blink_rate=self.window.blink_rate,
            sentiment_valence=sentiment,
        )
        self.window.add(snapshot)
        return snapshot

    def _compute_eye_contact(self, landmarks: list) -> float:
        """Compute gaze score from iris landmarks (468-477).

        Left iris: 468-472, right iris: 473-477.
        Index 468 = left iris center, 473 = right iris center.
        Compare iris center position relative to eye corner midpoints
        to estimate how centered the gaze is.
        """
        if len(landmarks) < 478:
            return 0.0

        # Left eye corners: 33 (outer), 133 (inner)
        # Right eye corners: 362 (outer), 263 (inner)
        left_outer = landmarks[33]
        left_inner = landmarks[133]
        right_outer = landmarks[362]
        right_inner = landmarks[263]

        # Iris centers
        left_iris = landmarks[468]
        right_iris = landmarks[473]

        # Left eye: how centered is the iris between eye corners
        left_eye_cx = (left_outer.x + left_inner.x) / 2
        left_eye_cy = (left_outer.y + left_inner.y) / 2
        left_eye_width = abs(left_inner.x - left_outer.x)
        if left_eye_width < 1e-6:
            return 0.0
        left_dx = abs(left_iris.x - left_eye_cx) / left_eye_width
        left_dy = abs(left_iris.y - left_eye_cy) / left_eye_width

        # Right eye: same calculation
        right_eye_cx = (right_outer.x + right_inner.x) / 2
        right_eye_cy = (right_outer.y + right_inner.y) / 2
        right_eye_width = abs(right_inner.x - right_outer.x)
        if right_eye_width < 1e-6:
            return 0.0
        right_dx = abs(right_iris.x - right_eye_cx) / right_eye_width
        right_dy = abs(right_iris.y - right_eye_cy) / right_eye_width

        # Average deviation — lower is better (more centered = looking at camera)
        avg_deviation = (left_dx + left_dy + right_dx + right_dy) / 4

        # Convert to 0-1 score: 0 deviation → 1.0, high deviation → 0.0
        score = max(0.0, 1.0 - avg_deviation * 4)
        return round(score, 3)

    def _compute_head_pose(self, landmarks: list) -> tuple[float, float, float]:
        """Estimate head yaw, pitch, roll from 6 key face points using solvePnP-like math.

        Key points:
        - Nose tip: 1
        - Chin: 152
        - Left eye outer: 33
        - Right eye outer: 263
        - Mouth left: 61
        - Mouth right: 291
        """
        if len(landmarks) < 292:
            return (0.0, 0.0, 0.0)

        # 3D model points (canonical face in normalized coords)
        model_points = np.array(
            [
                [0.0, 0.0, 0.0],  # Nose tip
                [0.0, -0.33, -0.065],  # Chin
                [-0.225, 0.17, -0.135],  # Left eye outer
                [0.225, 0.17, -0.135],  # Right eye outer
                [-0.15, -0.15, -0.125],  # Mouth left
                [0.15, -0.15, -0.125],  # Mouth right
            ],
            dtype=np.float64,
        )

        indices = [1, 152, 33, 263, 61, 291]
        image_points = np.array(
            [[landmarks[i].x, landmarks[i].y] for i in indices],
            dtype=np.float64,
        )

        # Estimate yaw from horizontal asymmetry (nose relative to eye midpoint)
        nose = landmarks[1]
        left_eye = landmarks[33]
        right_eye = landmarks[263]
        eye_mid_x = (left_eye.x + right_eye.x) / 2
        eye_width = abs(right_eye.x - left_eye.x)
        if eye_width < 1e-6:
            return (0.0, 0.0, 0.0)

        yaw_ratio = (nose.x - eye_mid_x) / eye_width
        yaw = math.degrees(math.atan2(yaw_ratio, 1.0))

        # Estimate pitch from vertical: nose vs midpoint of eyes and chin
        chin = landmarks[152]
        face_height = abs(chin.y - ((left_eye.y + right_eye.y) / 2))
        if face_height < 1e-6:
            return (yaw, 0.0, 0.0)
        eye_mid_y = (left_eye.y + right_eye.y) / 2
        vert_mid = (eye_mid_y + chin.y) / 2
        pitch_ratio = (nose.y - vert_mid) / face_height
        pitch = math.degrees(math.atan2(pitch_ratio, 1.0))

        # Estimate roll from eye tilt
        roll = math.degrees(
            math.atan2(right_eye.y - left_eye.y, right_eye.x - left_eye.x)
        )

        return (round(yaw, 2), round(pitch, 2), round(roll, 2))

    def _compute_mouth_open(self, landmarks: list) -> float:
        """Compute mouth open ratio: distance between upper lip (13) and lower lip (14)
        divided by face width (distance between mouth corners 61 and 291).
        """
        if len(landmarks) < 292:
            return 0.0

        upper_lip = landmarks[13]
        lower_lip = landmarks[14]
        mouth_left = landmarks[61]
        mouth_right = landmarks[291]

        lip_dist = math.sqrt(
            (upper_lip.x - lower_lip.x) ** 2 + (upper_lip.y - lower_lip.y) ** 2
        )
        mouth_width = math.sqrt(
            (mouth_left.x - mouth_right.x) ** 2
            + (mouth_left.y - mouth_right.y) ** 2
        )

        if mouth_width < 1e-6:
            return 0.0

        ratio = lip_dist / mouth_width
        return round(min(ratio, 1.0), 3)

    def _compute_sentiment(self, landmarks: list) -> float:
        """Estimate facial expression valence from mouth curvature.

        Compares mouth corner Y positions to mouth center Y position.
        Smile → corners higher than center → positive valence.
        """
        if len(landmarks) < 292:
            return 0.0

        mouth_left = landmarks[61]
        mouth_right = landmarks[291]
        upper_lip = landmarks[13]

        corner_avg_y = (mouth_left.y + mouth_right.y) / 2
        # In normalized coords, lower Y = higher on screen
        # Smile: corners are higher (lower Y) than lip center
        diff = upper_lip.y - corner_avg_y

        # Normalize to roughly -1..1 range
        valence = max(-1.0, min(1.0, diff * 20))
        return round(valence, 3)
