import { useRef, useCallback } from "react";

const VISION_WS_URL =
  process.env.NEXT_PUBLIC_VISION_WS_URL || "ws://localhost:8083";

interface VisionWarning {
  type: string;
  severity: string;
  message: string;
}

export function useLandmarks(
  sessionId: string | null,
  onWarning?: (warnings: VisionWarning[]) => void,
) {
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!sessionId) return;

    const ws = new WebSocket(`${VISION_WS_URL}/ws/landmarks/${sessionId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "vision.warning" && onWarning) {
        onWarning(data.warnings);
      }
    };
  }, [sessionId, onWarning]);

  const sendLandmarks = useCallback(
    (landmarks: unknown) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(landmarks));
      }
    },
    [],
  );

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  return { connect, sendLandmarks, disconnect };
}
