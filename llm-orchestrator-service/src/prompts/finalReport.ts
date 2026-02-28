export function finalReportPrompt(
  targetRole: string,
  turns: { question: string; answer: string; score: number; category: string }[],
): string {
  const turnsText = turns
    .map(
      (t, i) =>
        `Turn ${i + 1} [${t.category}] (Score: ${t.score}/10)\nQ: ${t.question}\nA: ${t.answer}`,
    )
    .join("\n\n");

  return `You are an expert interview coach generating a final report.

Target Role: ${targetRole}
Interview Turns:
${turnsText}

Generate a comprehensive report with:
1. Overall score (0-100)
2. Category scores (Technical, Communication, Problem-solving, Cultural Fit)
3. Per-turn detailed scores
4. Top 3 strengths observed
5. Actionable improvements (not just "improve X" but specific advice with examples)

Return a JSON object:
{
  "overallScore": number (0-100),
  "categories": [
    { "name": string, "score": number, "maxScore": 100, "feedback": string }
  ],
  "turnScores": [
    {
      "questionIndex": number,
      "score": number (0-10),
      "feedback": string,
      "confidenceScore": number (0-1),
      "starComponents": { "situation": bool, "task": bool, "action": bool, "result": bool }
    }
  ],
  "strengths": string[],
  "improvements": [
    {
      "area": string,
      "currentLevel": string,
      "suggestion": string,
      "example": string (concrete example of a better answer)
    }
  ]
}

Return ONLY valid JSON, no markdown fences.`;
}
