from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.models.landmarks import LandmarkFrame
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
                    {
                        "type": "vision.warning",
                        "sessionId": session_id,
                        "warnings": [w.model_dump() for w in warnings],
                    }
                )
    except WebSocketDisconnect:
        pass
