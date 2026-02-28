import { z } from "zod";

export const questionPlanSchema = z.object({
  targetRole: z.string(),
  difficulty: z.enum(["entry", "mid", "senior"]),
  questions: z.array(
    z.object({
      index: z.number(),
      category: z.string(),
      topic: z.string(),
      mainQuestion: z.string(),
      followUps: z.array(z.string()),
    }),
  ),
});

export type QuestionPlan = z.infer<typeof questionPlanSchema>;
