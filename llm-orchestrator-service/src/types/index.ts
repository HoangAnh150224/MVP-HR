export interface CVProfile {
  name: string;
  email: string;
  targetRole: string;
  yearsExperience: number;
  skills: string[];
  softSkills: string[];
  experiences: {
    company: string;
    role: string;
    duration: string;
    highlights: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
  strengths: string[];
  gaps: string[];
}

export interface QuestionPlan {
  sessionId: string;
  targetRole: string;
  difficulty: "entry" | "mid" | "senior";
  questions: {
    index: number;
    category: string;
    topic: string;
    mainQuestion: string;
    followUps: string[];
  }[];
}

export interface TurnScore {
  questionIndex: number;
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

export interface FinalReport {
  sessionId: string;
  overallScore: number;
  categories: {
    name: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
  turnScores: TurnScore[];
  strengths: string[];
  improvements: {
    area: string;
    currentLevel: string;
    suggestion: string;
    example: string;
  }[];
}
