from pydantic import BaseModel


class Landmark(BaseModel):
    x: float
    y: float
    z: float
    visibility: float = 1.0


class LandmarkFrame(BaseModel):
    timestamp: float
    face_landmarks: list[Landmark]
    pose_landmarks: list[Landmark] | None = None
