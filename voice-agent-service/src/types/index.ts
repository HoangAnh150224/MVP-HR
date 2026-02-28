export interface QuestionPlan {
  sessionId: string;
  targetRole: string;
  difficulty: "entry" | "mid" | "senior";
  questions: PlannedQuestion[];
}

export interface PlannedQuestion {
  index: number;
  category: string;
  topic: string;
  mainQuestion: string;
  followUps: string[];
}

export interface TranscriptTurn {
  speaker: "candidate" | "agent";
  text: string;
  startTime: number;
  endTime: number;
}

export interface AgentResponse {
  audio: ArrayBuffer;
  transcript: string;
}
