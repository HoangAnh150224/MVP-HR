export interface Report {
  sessionId: string;
  overallScore: number;
  categories: ScoreCategory[];
  turnScores: TurnScore[];
  strengths: string[];
  improvements: ActionableImprovement[];
  starAnalysis: STARAnalysis[];
  confidenceTrend: number[];
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
