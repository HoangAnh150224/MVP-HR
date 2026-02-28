export type SessionState =
  | "CREATED"
  | "CV_UPLOADING"
  | "CV_PARSED"
  | "CONSENT_PENDING"
  | "JOINING"
  | "LIVE"
  | "WRAP_UP"
  | "ENDED"
  | "SCORING"
  | "REPORT_READY";

export interface Session {
  id: string;
  userId: string;
  state: SessionState;
  targetRole: string;
  difficulty: "entry" | "mid" | "senior";
  mode: "scored" | "practice";
  createdAt: string;
  updatedAt: string;
}
