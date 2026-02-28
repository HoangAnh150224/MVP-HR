from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.models.landmarks import LandmarkFrame
from app.services.signal_processor import SignalProcessor
from app.services.warning_emitter import WarningEmitter

router = APIRouter()

# Session-level metrics accumulator
_session_metrics: dict[str, dict] = {}


def _get_session_accumulator(session_id: str) -> dict:
    if session_id not in _session_metrics:
        _session_metrics[session_id] = {
            "eye_contact_frames": 0,
            "total_frames": 0,
            "posture_warnings": 0,
            "sentiment_sum": 0.0,
            "sentiment_count": 0,
        }
    return _session_metrics[session_id]


@router.websocket("/landmarks/{session_id}")
async def landmarks_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    processor = SignalProcessor()
    emitter = WarningEmitter()
    acc = _get_session_accumulator(session_id)

    try:
        while True:
            data = await websocket.receive_json()
            frame = LandmarkFrame.model_validate(data)

            signals = processor.process(frame)
            warnings = emitter.evaluate(signals)

            # Accumulate metrics
            acc["total_frames"] += 1
            if hasattr(signals, "eye_contact") and signals.eye_contact:
                acc["eye_contact_frames"] += 1
            if hasattr(signals, "sentiment"):
                acc["sentiment_sum"] += signals.sentiment
                acc["sentiment_count"] += 1

            if warnings:
                for w in warnings:
                    if hasattr(w, "type") and "posture" in str(w.type).lower():
                        acc["posture_warnings"] += 1

                await websocket.send_json(
                    {
                        "type": "vision.warning",
                        "sessionId": session_id,
                        "warnings": [w.model_dump() for w in warnings],
                    }
                )
    except WebSocketDisconnect:
        pass


@router.get("/sessions/{session_id}/vision-metrics")
async def get_vision_metrics(session_id: str):
    acc = _session_metrics.get(session_id)
    if acc is None or acc["total_frames"] == 0:
        return {
            "eyeContactPercent": 0,
            "postureWarnings": 0,
            "avgSentiment": 0.0,
            "totalFrames": 0,
        }
    return {
        "eyeContactPercent": round(
            (acc["eye_contact_frames"] / acc["total_frames"]) * 100, 1
        ),
        "postureWarnings": acc["posture_warnings"],
        "avgSentiment": round(
            acc["sentiment_sum"] / acc["sentiment_count"], 2
        )
        if acc["sentiment_count"] > 0
        else 0.0,
        "totalFrames": acc["total_frames"],
    }
