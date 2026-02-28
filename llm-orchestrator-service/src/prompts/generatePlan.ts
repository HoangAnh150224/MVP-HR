import type { CVProfile } from "../types/index.js";

export function generatePlanPrompt(
  profile: CVProfile,
  difficulty: "entry" | "mid" | "senior",
): string {
  return `You are an expert interview coach. Generate a question plan for a ${difficulty}-level interview.

Candidate Profile:
- Name: ${profile.name}
- Target Role: ${profile.targetRole}
- Years of Experience: ${profile.yearsExperience}
- Skills: ${profile.skills.join(", ")}
- Strengths: ${profile.strengths.join(", ")}
- Gaps to probe: ${profile.gaps.join(", ")}

Difficulty: ${difficulty}
- entry: basic concepts, simple scenarios, straightforward questions
- mid: applied knowledge, complex scenarios, trade-off discussions
- senior: system design, leadership, strategic thinking, deep expertise

Generate 6-8 questions covering these categories:
1. Technical (based on skills)
2. Behavioral (STAR-format expected)
3. Problem-solving
4. Role-specific

Return a JSON object:
{
  "targetRole": string,
  "difficulty": "${difficulty}",
  "questions": [
    {
      "index": number,
      "category": "technical" | "behavioral" | "problem-solving" | "role-specific",
      "topic": string,
      "mainQuestion": string,
      "followUps": string[]
    }
  ]
}

Return ONLY valid JSON, no markdown fences.`;
}
