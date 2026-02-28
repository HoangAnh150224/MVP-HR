import { z } from "zod";

export const turnScoreWithAnalysisSchema = z.object({
  questionIndex: z.number(),
  score: z.number().min(0).max(10),
  feedback: z.string(),
  confidenceScore: z.number().min(0).max(1),
  starComponents: z.object({
    situation: z.boolean(),
    task: z.boolean(),
    action: z.boolean(),
    result: z.boolean(),
  }),
  starAnalysis: z.object({
    missing: z.array(z.string()),
    suggestion: z.string(),
  }).optional(),
  sampleAnswer: z.string().optional(),
});

export const reportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  categories: z.array(
    z.object({
      name: z.string(),
      score: z.number(),
      maxScore: z.number(),
      feedback: z.string(),
    }),
  ),
  turnScores: z.array(turnScoreWithAnalysisSchema),
  strengths: z.array(z.string()),
  improvements: z.array(
    z.object({
      area: z.string(),
      currentLevel: z.string(),
      suggestion: z.string(),
      example: z.string(),
    }),
  ),
  speechFeedback: z.string().nullable().optional(),
  visionFeedback: z.string().nullable().optional(),
});

export type Report = z.infer<typeof reportSchema>;
