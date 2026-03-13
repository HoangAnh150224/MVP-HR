import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.models.landmarks import LandmarkFrame
from app.services.signal_processor import SignalProcessor
from app.services.warning_emitter import WarningEmitter

router = APIRouter()

# Session-level metrics accumulator
_session_metrics: dict[str, dict] = {}

WARNING_COOLDOWN_S = 5.0


def _get_session_accumulator(session_id: str) -> dict:
    if session_id not in _session_metrics:
        _session_metrics[session_id] = {
            "eye_contact_frames": 0,
            "total_frames": 0,
            "posture_warnings": 0,
            "sentiment_sum": 0.0,
            "sentiment_count": 0,
            "expression_counts": {
                "happy": 0,
                "neutral": 0,
                "surprised": 0,
                "concerned": 0,
                "confused": 0,
            },
            "expression_warnings": 0,
        }
    return _session_metrics[session_id]


@router.websocket("/landmarks/{session_id}")
async def landmarks_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    processor = SignalProcessor()
    emitter = WarningEmitter()
    acc = _get_session_accumulator(session_id)
    last_warning_times: dict[str, float] = {}

    try:
        while True:
            data = await websocket.receive_json()
            frame = LandmarkFrame.model_validate(data)

            signals = processor.process(frame)
            warnings = emitter.evaluate(signals)

            # Accumulate metrics
            acc["total_frames"] += 1
            if signals.eye_contact_score > 0.5:
                acc["eye_contact_frames"] += 1
            acc["sentiment_sum"] += signals.sentiment_valence
            acc["sentiment_count"] += 1

            # Accumulate expression counts
            if signals.dominant_emotion:
                emotion = signals.dominant_emotion
                if emotion in acc["expression_counts"]:
                    acc["expression_counts"][emotion] += 1

            # Apply cooldown per warning type
            now = time.monotonic()
            filtered: list = []
            for w in warnings:
                last_t = last_warning_times.get(w.type, 0.0)
                if now - last_t >= WARNING_COOLDOWN_S:
                    filtered.append(w)
                    last_warning_times[w.type] = now
                    if w.type == "posture":
                        acc["posture_warnings"] += 1
                    elif w.type == "expression":
                        acc["expression_warnings"] += 1

            if filtered:
                await websocket.send_json(
                    {
                        "type": "vision.warning",
                        "sessionId": session_id,
                        "warnings": [w.model_dump() for w in filtered],
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
            "expressionBreakdown": {
                "happy": 0,
                "neutral": 0,
                "surprised": 0,
                "concerned": 0,
                "confused": 0,
            },
            "expressionWarnings": 0,
        }

    total = acc["total_frames"]
    expr_counts = acc["expression_counts"]
    expr_breakdown = {
        k: round((v / total) * 100, 1) for k, v in expr_counts.items()
    }

    return {
        "eyeContactPercent": round(
            (acc["eye_contact_frames"] / total) * 100, 1
        ),
        "postureWarnings": acc["posture_warnings"],
        "avgSentiment": round(
            acc["sentiment_sum"] / acc["sentiment_count"], 2
        )
        if acc["sentiment_count"] > 0
        else 0.0,
        "totalFrames": total,
        "expressionBreakdown": expr_breakdown,
        "expressionWarnings": acc["expression_warnings"],
    }
