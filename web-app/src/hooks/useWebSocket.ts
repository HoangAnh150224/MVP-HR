import { useEffect, useRef } from "react";
import { WebSocketClient } from "@/lib/ws";
import type { EventEnvelope, EventType } from "@/types/events";

export function useWebSocket(
  sessionId: string | null,
  token: string | null,
  handlers: Partial<Record<EventType, (event: EventEnvelope) => void>>,
) {
  const clientRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    if (!sessionId || !token) return;

    const client = new WebSocketClient(sessionId);
    clientRef.current = client;

    for (const [type, handler] of Object.entries(handlers)) {
      if (handler) client.on(type, handler);
    }

    client.connect(token);

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [sessionId, token]);

  return clientRef;
}
