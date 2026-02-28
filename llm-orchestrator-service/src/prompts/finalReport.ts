export function finalReportPrompt(
  targetRole: string,
  turns: { question: string; answer: string; score: number; category: string }[],
  speechMetrics?: { avgWpm: number; totalFillers: number; topFillers: Record<string, number>; totalUtteranceSeconds: number },
  visionMetrics?: { eyeContactPercent: number; postureWarnings: number; avgSentiment: number },
): string {
  const turnsText = turns
    .map(
      (t, i) =>
        `Turn ${i + 1} [${t.category}] (Score: ${t.score}/10)\nQ: ${t.question}\nA: ${t.answer}`,
    )
    .join("\n\n");

  let speechSection = "";
  if (speechMetrics) {
    speechSection = `
Speech Metrics:
- Average WPM: ${speechMetrics.avgWpm}
- Total filler words: ${speechMetrics.totalFillers}
- Top fillers: ${JSON.stringify(speechMetrics.topFillers)}
- Total speaking time: ${speechMetrics.totalUtteranceSeconds}s
`;
  }

  let visionSection = "";
  if (visionMetrics) {
    visionSection = `
Body Language Metrics:
- Eye contact: ${visionMetrics.eyeContactPercent}%
- Posture warnings: ${visionMetrics.postureWarnings}
- Average sentiment: ${visionMetrics.avgSentiment}
`;
  }

  return `You are an expert interview coach generating a final report in Vietnamese.

Target Role: ${targetRole}
Interview Turns:
${turnsText}
${speechSection}${visionSection}
Generate a comprehensive report with:
1. Overall score (0-100)
2. Category scores (Technical, Communication, Problem-solving, Cultural Fit)
3. Per-turn detailed scores with:
   - STAR analysis (which components are missing + suggestion to improve)
   - A model sample answer (sampleAnswer) showing how to answer the question well
4. Top 3 strengths observed
5. Actionable improvements (not just "improve X" but specific advice with examples)
6. If speech metrics are provided, comment on speaking pace and filler word usage
7. If vision metrics are provided, comment on body language

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
      "starComponents": { "situation": bool, "task": bool, "action": bool, "result": bool },
      "starAnalysis": {
        "missing": string[] (list of missing STAR components, e.g. ["result", "situation"]),
        "suggestion": string (Vietnamese suggestion on how to add the missing components)
      },
      "sampleAnswer": string (a model answer in Vietnamese showing how to answer this question well, using STAR method where applicable, 3-5 sentences)
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
  ],
  "speechFeedback": string | null (feedback on speech patterns if metrics provided),
  "visionFeedback": string | null (feedback on body language if metrics provided)
}

Return ONLY valid JSON, no markdown fences.`;
}
