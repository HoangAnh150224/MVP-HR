export function extractProfilePrompt(
  cvText: string,
  targetRole: string,
): string {
  return `You are an expert CV analyst. Extract a structured profile from the following CV.
Target role: ${targetRole}

CV Content:
---
${cvText}
---

Return a JSON object with this structure:
- name: string
- email: string (or empty string if not found)
- targetRole: string
- yearsExperience: number
- skills: string[] (technical skills)
- softSkills: string[] (communication, leadership, etc.)
- experiences: Array<{ company: string, role: string, duration: string, highlights: string[] }>
- education: Array<{ institution: string, degree: string, year: string }>
- strengths: string[] (relevant to target role)
- gaps: string[] (areas to probe in interview)

Return ONLY valid JSON, no markdown fences.`;
}
