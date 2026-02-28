# Skill: vision-analytics-service (Body Language Analytics)

## Service Description
**Stack**: Python 3.12, FastAPI, WebSocket, NumPy
**Port**: 8083
**Path**: `vision-analytics-service/`

The vision-analytics-service receives face/body landmark data from the web-app browser (captured via MediaPipe in-browser) over a WebSocket connection. It processes these landmarks to compute body language signals (eye contact, head pose, posture), maintains rolling time windows, and emits real-time warnings back to the candidate.

## When to Use This Skill
- Implementing WebSocket endpoints for landmark ingestion
- Computing body language signals from landmark data
- Implementing rolling window time-series processing
- Generating real-time warnings (eye contact, posture)
- Defining Pydantic models for landmarks, signals, warnings
- Sentiment analysis from facial landmarks

## Folder Structure
```
vision-analytics-service/
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI entry point
│   ├── routers/
│   │   └── landmarks.py          # WebSocket endpoint
│   ├── services/
│   │   ├── signal_processor.py   # Compute signals from landmarks
│   │   ├── warning_emitter.py    # Generate warnings
│   │   └── rolling_window.py     # Time-series rolling window
│   ├── models/
│   │   ├── landmarks.py          # Pydantic: LandmarkFrame
│   │   ├── signals.py            # Pydantic: SignalSnapshot
│   │   └── warnings.py           # Pydantic: Warning
│   ├── config/
│   │   └── settings.py           # Pydantic Settings
│   └── utils/
│       └── math_utils.py         # Angle calculations, etc.
├── tests/
├── requirements.txt
├── Dockerfile
└── .env.example
```

## Conventions

### FastAPI Entry Point Pattern
```python
from fastapi import FastAPI
from app.routers import landmarks
from app.config.settings import settings

app = FastAPI(title="Vision Analytics Service", version="0.1.0")

app.include_router(landmarks.router, prefix="/ws")

@app.get("/health")
async def health():
    return {"status": "ok"}
```

### WebSocket Endpoint Pattern
```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.signal_processor import SignalProcessor
from app.services.warning_emitter import WarningEmitter

router = APIRouter()

@router.websocket("/landmarks/{session_id}")
async def landmarks_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    processor = SignalProcessor()
    emitter = WarningEmitter()

    try:
        while True:
            data = await websocket.receive_json()
            frame = LandmarkFrame.model_validate(data)

            signals = processor.process(frame)
            warnings = emitter.evaluate(signals)

            if warnings:
                await websocket.send_json(
                    {"type": "vision.warning", "sessionId": session_id, "warnings": [w.model_dump() for w in warnings]}
                )
    except WebSocketDisconnect:
        pass
```

### Pydantic Model Patterns
```python
from pydantic import BaseModel

class Landmark(BaseModel):
    x: float
    y: float
    z: float
    visibility: float = 1.0

class LandmarkFrame(BaseModel):
    timestamp: float
    face_landmarks: list[Landmark]  # 478 points (MediaPipe Face Mesh)
    pose_landmarks: list[Landmark] | None = None  # 33 points (optional)

class SignalSnapshot(BaseModel):
    timestamp: float
    eye_contact_score: float          # 0.0 - 1.0
    head_yaw: float                   # degrees
    head_pitch: float                 # degrees
    head_roll: float                  # degrees
    mouth_open_ratio: float           # 0.0 - 1.0
    blink_rate: float                 # blinks per minute
    sentiment_valence: float          # -1.0 (negative) to 1.0 (positive)

class Warning(BaseModel):
    type: str                         # "eye_contact", "posture", "fidgeting"
    severity: str                     # "info", "warning", "critical"
    message: str                      # Human-readable message
    value: float                      # Current metric value
    threshold: float                  # Threshold that was exceeded
```

### Signal Processing Pattern
```python
import numpy as np
from app.models.landmarks import LandmarkFrame, SignalSnapshot
from app.services.rolling_window import RollingWindow

class SignalProcessor:
    def __init__(self, window_size: int = 30):
        self.window = RollingWindow(window_size)

    def process(self, frame: LandmarkFrame) -> SignalSnapshot:
        eye_contact = self._compute_eye_contact(frame.face_landmarks)
        head_yaw, head_pitch, head_roll = self._compute_head_pose(frame.face_landmarks)
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
        # Use iris landmarks (468-477) to compute gaze direction
        # Score based on how centered the gaze is
        pass

    def _compute_head_pose(self, landmarks: list) -> tuple[float, float, float]:
        # Use key face points to estimate head rotation
        # Returns (yaw, pitch, roll) in degrees
        pass

    def _compute_sentiment(self, landmarks: list) -> float:
        # Analyze facial expression: mouth corners, eyebrow position
        # Returns valence from -1.0 (negative) to 1.0 (positive)
        pass
```

### Rolling Window Pattern
```python
from collections import deque
from app.models.signals import SignalSnapshot

class RollingWindow:
    def __init__(self, max_size: int = 30):
        self._buffer: deque[SignalSnapshot] = deque(maxlen=max_size)

    def add(self, snapshot: SignalSnapshot) -> None:
        self._buffer.append(snapshot)

    @property
    def eye_contact_avg(self) -> float:
        if not self._buffer:
            return 0.0
        return sum(s.eye_contact_score for s in self._buffer) / len(self._buffer)

    @property
    def blink_rate(self) -> float:
        # Compute blinks per minute from recent frames
        pass
```

### Warning Emitter Pattern
```python
from app.models.signals import SignalSnapshot
from app.models.warnings import Warning

class WarningEmitter:
    THRESHOLDS = {
        "eye_contact": {"warning": 0.3, "critical": 0.15},
        "head_yaw": {"warning": 25.0, "critical": 40.0},
    }

    def evaluate(self, signals: SignalSnapshot) -> list[Warning]:
        warnings = []
        if signals.eye_contact_score < self.THRESHOLDS["eye_contact"]["critical"]:
            warnings.append(Warning(
                type="eye_contact", severity="critical",
                message="Hãy nhìn vào camera để duy trì giao tiếp bằng mắt",
                value=signals.eye_contact_score,
                threshold=self.THRESHOLDS["eye_contact"]["critical"],
            ))
        return warnings
```

### Pydantic Settings Pattern
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    host: str = "0.0.0.0"
    port: int = 8083
    cors_origins: list[str] = ["http://localhost:3000"]
    window_size: int = 30
    warning_cooldown_seconds: float = 5.0

    class Config:
        env_prefix = "VISION_"
        env_file = ".env"

settings = Settings()
```

## Features from Competitive Research

### Sentiment Analysis
- Compute facial expression valence from landmark positions
- Track mouth corners (smile vs frown), eyebrow raise, eye openness
- Include `sentiment_valence` in signal snapshot
- Report average sentiment per question in final analytics

### Eye Contact Score
- Use MediaPipe iris landmarks (468-477) for gaze estimation
- Score 0.0-1.0 based on gaze direction relative to camera
- Include rolling average in session analytics
- Real-time warning when eye contact drops below threshold

## Key Dependencies
```
fastapi>=0.115.0
uvicorn>=0.32.0
pydantic>=2.10.0
pydantic-settings>=2.6.0
numpy>=2.1.0
websockets>=14.0
```

## Error Handling
- Invalid landmark data: skip frame, log warning, don't crash WebSocket
- WebSocket disconnect: clean up processor state
- Computation errors: catch per-signal, return partial results
- Use FastAPI exception handlers for HTTP endpoints

## Testing
- Unit tests: pytest for signal computation (with fixture landmark data)
- WebSocket tests: `httpx` AsyncClient with WebSocket support
- Property tests: hypothesis for edge cases in math computations
