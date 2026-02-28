export interface EventEnvelope<T = unknown> {
  type: EventType;
  sessionId: string;
  timestamp: string;
  payload: T;
}

export type EventType =
  | "session.state_changed"
  | "transcript.turn"
  | "transcript.partial"
  | "score.turn"
  | "vision.warning"
  | "agent.status"
  | "report.ready";

export interface TranscriptTurn {
  speaker: "candidate" | "agent";
  text: string;
  startTime: number;
  endTime: number;
}

export interface TranscriptPartial {
  speaker: "candidate" | "agent";
  text: string;
}

export interface VisionWarning {
  type: "eye_contact" | "posture" | "fidgeting";
  severity: "info" | "warning" | "critical";
  message: string;
  value: number;
  threshold: number;
}

export interface AgentStatus {
  status: "connecting" | "connected" | "speaking" | "listening" | "disconnected";
}
