from pydantic import BaseModel


class SignalSnapshot(BaseModel):
    timestamp: float
    eye_contact_score: float
    head_yaw: float
    head_pitch: float
    head_roll: float
    mouth_open_ratio: float
    blink_rate: float
    sentiment_valence: float
