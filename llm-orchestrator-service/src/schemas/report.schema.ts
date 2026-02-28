import { z } from "zod";
import { turnScoreSchema } from "./score.schema.js";

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
  turnScores: z.array(turnScoreSchema),
  strengths: z.array(z.string()),
  improvements: z.array(
    z.object({
      area: z.string(),
      currentLevel: z.string(),
      suggestion: z.string(),
      example: z.string(),
    }),
  ),
});

export type Report = z.infer<typeof reportSchema>;
