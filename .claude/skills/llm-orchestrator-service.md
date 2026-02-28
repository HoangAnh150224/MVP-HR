# Skill: llm-orchestrator-service (LLM Orchestration)

## Service Description
**Stack**: Node.js, TypeScript, Express, Gemini API, Zod
**Port**: 8082
**Path**: `llm-orchestrator-service/`

The llm-orchestrator-service is an internal HTTP service that handles all structured LLM calls. It parses CVs into structured profiles, generates question plans, scores individual interview turns, and produces final reports. All LLM outputs are validated against JSON schemas using Zod.

## When to Use This Skill
- Creating or modifying LLM prompt templates
- Defining JSON schemas for LLM outputs (Zod)
- Implementing CV parsing logic
- Implementing question plan generation
- Implementing turn scoring
- Implementing final report generation
- Adding new LLM-powered features (STAR coaching, confidence scoring)
- Schema validation logic

## Folder Structure
```
llm-orchestrator-service/src/
├── index.ts                    # Express app entry point
├── routes/
│   ├── profileRoutes.ts        # POST /internal/cv-profiles/parse
│   ├── questionPlanRoutes.ts   # POST /internal/question-plans/generate
│   └── scoringRoutes.ts        # POST /internal/scoring/turn, /internal/scoring/final
├── services/
│   ├── CVProfileService.ts     # CV text → structured profile
│   ├── QuestionPlanService.ts  # Profile → question plan
│   ├── ScoringService.ts       # Turn scoring + confidence
│   └── ReportService.ts        # All turns → final report
├── prompts/
│   ├── extractProfile.ts       # CV extraction prompt template
│   ├── generatePlan.ts         # Question plan prompt template
│   ├── scoreTurn.ts            # Per-turn scoring prompt
│   └── finalReport.ts          # Final report prompt
├── schemas/
│   ├── cvProfile.schema.ts     # Zod schema for CV profile
│   ├── questionPlan.schema.ts  # Zod schema for question plan
│   ├── score.schema.ts         # Zod schema for turn score
│   └── report.schema.ts        # Zod schema for report
├── validation/
│   └── schemaValidator.ts      # Generic LLM output validator
├── config/
│   └── config.ts
└── types/
    └── index.ts
```

## Conventions

### Route Pattern
```typescript
import { Router } from "express";
import { CVProfileService } from "../services/CVProfileService";

const router = Router();
const cvProfileService = new CVProfileService();

router.post("/internal/cv-profiles/parse", async (req, res, next) => {
  try {
    const { cvText, targetRole } = req.body;
    const profile = await cvProfileService.parse(cvText, targetRole);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

export default router;
```

### Service Pattern with LLM Call
```typescript
import { generateContent } from "../config/gemini";
import { extractProfilePrompt } from "../prompts/extractProfile";
import { cvProfileSchema, CVProfile } from "../schemas/cvProfile.schema";
import { validateLLMOutput } from "../validation/schemaValidator";

export class CVProfileService {
  async parse(cvText: string, targetRole: string): Promise<CVProfile> {
    const prompt = extractProfilePrompt(cvText, targetRole);
    const raw = await generateContent(prompt, { responseFormat: "json" });
    return validateLLMOutput(raw, cvProfileSchema);
  }
}
```

### Prompt Template Pattern
```typescript
export function extractProfilePrompt(cvText: string, targetRole: string): string {
  return `
You are an expert CV analyst. Extract a structured profile from the following CV.
Target role: ${targetRole}

CV Content:
---
${cvText}
---

Return a JSON object with this structure:
- name: string
- email: string
- targetRole: string
- yearsExperience: number
- skills: string[] (technical skills)
- softSkills: string[] (communication, leadership, etc.)
- experiences: Array<{ company, role, duration, highlights: string[] }>
- education: Array<{ institution, degree, year }>
- strengths: string[] (relevant to target role)
- gaps: string[] (areas to probe in interview)

Return ONLY valid JSON, no markdown.
`;
}
```

### Zod Schema Pattern
```typescript
import { z } from "zod";

export const cvProfileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  targetRole: z.string(),
  yearsExperience: z.number().min(0),
  skills: z.array(z.string()),
  softSkills: z.array(z.string()),
  experiences: z.array(z.object({
    company: z.string(),
    role: z.string(),
    duration: z.string(),
    highlights: z.array(z.string()),
  })),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    year: z.string(),
  })),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
});

export type CVProfile = z.infer<typeof cvProfileSchema>;
```

### Schema Validator Pattern
```typescript
import { ZodSchema, ZodError } from "zod";

export function validateLLMOutput<T>(raw: string, schema: ZodSchema<T>): T {
  const parsed = JSON.parse(raw);
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new SchemaValidationError(
      "LLM output failed schema validation",
      result.error
    );
  }
  return result.data;
}
```

## API Endpoints (Internal Only)

| Method | Path | Description |
|--------|------|-------------|
| POST | /internal/cv-profiles/parse | Parse CV text → structured profile |
| POST | /internal/question-plans/generate | Profile → question plan |
| POST | /internal/scoring/turn | Score a single interview turn |
| POST | /internal/scoring/final | Generate final report from all turns |
| GET | /health | Health check |

## Features from Competitive Research

### STAR Method Coaching
- In `scoreTurn` prompt, evaluate if answer follows STAR (Situation, Task, Action, Result)
- Score each STAR component separately
- In report, provide specific coaching: "Your answer lacked a clear Result. Try quantifying the outcome."

### Confidence Scoring
- Analyze speech patterns in transcript: filler words ("um", "uh"), hedging language
- Add `confidenceScore` field to turn scoring schema
- Include confidence trend in final report

### Actionable Feedback
- Final report includes specific, actionable improvement suggestions
- Not just "Communication: 7/10" but "Try using the STAR method for behavioral questions. Your answer about project X would be stronger with a quantified result."

### Difficulty Levels
- Question plan generation accepts difficulty: "entry" | "mid" | "senior"
- Adjusts question complexity, expected depth, and scoring rubric accordingly

### Industry Benchmarking (P1 - Future)
- Compare scores against anonymized aggregate data for same role
- Percentile ranking: "You scored in the top 30% for System Design"

## Key Dependencies
```json
{
  "express": "^4.21.0",
  "@google/generative-ai": "^0.20.0",
  "zod": "^3.23.0"
}
```

## Error Handling
- LLM output validation failure: retry once with stricter prompt, then return error
- LLM API timeout: 30s timeout, retry once
- Invalid input: return 400 with validation details
- All errors follow standard envelope: `{ error: { code, message, details } }`

## Testing
- Unit tests: Vitest for schema validation, prompt generation
- Integration tests: mock Gemini API responses, verify full flow
- Schema tests: test with various LLM output variations to ensure robustness
