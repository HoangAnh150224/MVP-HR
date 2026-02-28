import { z } from "zod";

export const turnScoreSchema = z.object({
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
});

export type TurnScore = z.infer<typeof turnScoreSchema>;
