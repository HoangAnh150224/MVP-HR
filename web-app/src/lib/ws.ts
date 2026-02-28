import type { EventEnvelope } from "@/types/events";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

type EventHandler = (event: EventEnvelope) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  connect(token: string): void {
    this.ws = new WebSocket(`${WS_URL}/ws/events?token=${token}&sessionId=${this.sessionId}`);

    this.ws.onmessage = (event) => {
      const envelope: EventEnvelope = JSON.parse(event.data);
      const handlers = this.handlers.get(envelope.type);
      handlers?.forEach((handler) => handler(envelope));
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
        setTimeout(() => this.connect(token), delay);
      }
    };
  }

  on(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
    return () => this.handlers.get(eventType)?.delete(handler);
  }

  disconnect(): void {
    this.maxReconnectAttempts = 0;
    this.ws?.close();
  }
}
