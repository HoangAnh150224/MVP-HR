import type { CVProfile } from "../types/index.js";

interface ReferenceQuestion {
  category: string;
  topic?: string;
  questionText: string;
  followUps?: string;
  sampleAnswers?: string;
}

interface RoleTemplate {
  name: string;
  slug: string;
  description?: string;
  typicalSkills?: string;
}

interface ScoringCriterion {
  name: string;
  slug: string;
  weightPercent: number;
  description?: string;
}

export function generatePlanPrompt(
  profile: CVProfile,
  difficulty: "entry" | "mid" | "senior",
  referenceQuestions?: ReferenceQuestion[],
  roleTemplate?: RoleTemplate,
  scoringCriteria?: ScoringCriterion[],
): string {
  let roleContext = "";
  if (roleTemplate) {
    roleContext = `
Thông tin vị trí tuyển dụng (từ Knowledge Base):
- Tên: ${roleTemplate.name}
- Mô tả: ${roleTemplate.description || "N/A"}
- Kỹ năng phổ biến: ${roleTemplate.typicalSkills || "N/A"}
`;
  }

  let referenceSection = "";
  if (referenceQuestions && referenceQuestions.length > 0) {
    const refText = referenceQuestions
      .map(
        (q, i) =>
          `  ${i + 1}. [${q.category}] ${q.questionText}${q.topic ? ` (Chủ đề: ${q.topic})` : ""}`,
      )
      .join("\n");
    referenceSection = `
CÂU HỎI THAM KHẢO từ Knowledge Base (dùng làm cảm hứng, KHÔNG copy y nguyên):
${refText}

QUAN TRỌNG: Dựa vào các câu hỏi tham khảo để tạo câu hỏi MỚI, phù hợp hơn với profile ứng viên.
Câu hỏi phải được PERSONALIZE dựa trên kinh nghiệm và kỹ năng cụ thể của ứng viên.
`;
  }

  let scoringSection = "";
  if (scoringCriteria && scoringCriteria.length > 0) {
    const criteriaText = scoringCriteria
      .map((c) => `  - ${c.name} (${c.weightPercent}%): ${c.description || ""}`)
      .join("\n");
    scoringSection = `
5 TIÊU CHÍ ĐÁNH GIÁ (phải có câu hỏi cover hết):
${criteriaText}

Mỗi câu hỏi phải map vào 1 trong 5 category: confidence, communication, problem_solving, expertise, attitude.
`;
  }

  return `Bạn là chuyên gia coaching phỏng vấn. Tạo kế hoạch câu hỏi cho buổi phỏng vấn level ${difficulty}.

Hồ sơ ứng viên:
- Tên: ${profile.name}
- Vị trí ứng tuyển: ${profile.targetRole}
- Kinh nghiệm: ${profile.yearsExperience} năm
- Kỹ năng: ${profile.skills.join(", ")}
- Điểm mạnh: ${profile.strengths.join(", ")}
- Điểm cần khai thác: ${profile.gaps.join(", ")}
${roleContext}${referenceSection}${scoringSection}
Độ khó: ${difficulty}
- entry: khái niệm cơ bản, tình huống đơn giản
- mid: kiến thức ứng dụng, tình huống phức tạp, trade-off
- senior: thiết kế hệ thống, leadership, tư duy chiến lược

Tạo 10 câu hỏi đa dạng, chia đều 5 nhóm:
1. confidence (tự tin): giới thiệu, sở thích, điểm mạnh/yếu
2. communication (giao tiếp): giải thích kỹ thuật, teamwork, feedback
3. problem_solving (giải quyết vấn đề): debug, tối ưu, deadline
4. expertise (chuyên môn): kiến thức kỹ thuật cụ thể theo vị trí
5. attitude (thái độ): motivation, thất bại, học hỏi

CÂU HỎI PHẢI BẰNG TIẾNG VIỆT.

Return a JSON object:
{
  "targetRole": string,
  "difficulty": "${difficulty}",
  "questions": [
    {
      "index": number,
      "category": "confidence" | "communication" | "problem_solving" | "expertise" | "attitude",
      "topic": string,
      "mainQuestion": string (tiếng Việt),
      "followUps": string[] (tiếng Việt)
    }
  ]
}

Return ONLY valid JSON, no markdown fences.`;
}
