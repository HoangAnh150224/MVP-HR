export function scoreTurnPrompt(
  question: string,
  answer: string,
  category: string,
  difficulty: string,
): string {
  return `You are an expert interview evaluator. Score this interview turn.

Question: ${question}
Category: ${category}
Difficulty: ${difficulty}
Candidate's Answer: ${answer}

Evaluate the answer on:
1. Relevance and completeness (does it answer the question?)
2. Depth and specificity (concrete examples, not generic)
3. STAR method (for behavioral questions: Situation, Task, Action, Result)
4. Confidence indicators (filler words like "um", "uh", hedging language reduce confidence score)

Return a JSON object:
{
  "questionIndex": 0,
  "score": number (0-10),
  "feedback": string (specific, actionable feedback),
  "confidenceScore": number (0.0-1.0),
  "starComponents": {
    "situation": boolean,
    "task": boolean,
    "action": boolean,
    "result": boolean
  }
}

For non-behavioral questions, set all STAR components to true if the answer is well-structured.

Return ONLY valid JSON, no markdown fences.`;
}
