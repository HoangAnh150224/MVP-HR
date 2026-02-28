import { z } from "zod";

export const cvProfileSchema = z.object({
  name: z.string(),
  email: z.string().default(""),
  targetRole: z.string(),
  yearsExperience: z.number().min(0),
  skills: z.array(z.string()),
  softSkills: z.array(z.string()),
  experiences: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      duration: z.string(),
      highlights: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      year: z.string(),
    }),
  ),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
});

export type CVProfile = z.infer<typeof cvProfileSchema>;
