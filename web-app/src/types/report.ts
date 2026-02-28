export interface Report {
  sessionId: string;
  overallScore: number;
  categories: ScoreCategory[];
  turnScores: TurnScore[];
  strengths: string[];
  improvements: ActionableImprovement[];
  speechMetrics?: SpeechMetricsSummary;
  visionMetrics?: VisionMetricsSummary;
  speechFeedback?: string;
  visionFeedback?: string;
  generatedAt: string;
}

export interface ScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface TurnScore {
  questionIndex: number;
  question: string;
  score: number;
  feedback: string;
  confidenceScore: number;
  starComponents: {
    situation: boolean;
    task: boolean;
    action: boolean;
    result: boolean;
  };
  starAnalysis?: {
    missing: string[];
    suggestion: string;
  };
  sampleAnswer?: string;
}

export interface ActionableImprovement {
  area: string;
  currentLevel: string;
  suggestion: string;
  example: string;
}

export interface STARAnalysis {
  question: string;
  missing: string[];
  suggestion: string;
}

export interface SpeechMetricsSummary {
  avgWpm: number;
  totalFillers: number;
  topFillers: Record<string, number>;
  totalUtteranceSeconds: number;
}

export interface VisionMetricsSummary {
  eyeContactPercent: number;
  postureWarnings: number;
  avgSentiment: number;
  totalFrames: number;
}
