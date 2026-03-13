export function scoreTurnPrompt(
  question: string,
  answer: string,
  category: string,
  difficulty: string,
  sampleAnswers?: string,
  scoringRubric?: string,
  categoryRubric?: string,
): string {
  let sampleSection = "";
  if (sampleAnswers) {
    const samples =
      typeof sampleAnswers === "string"
        ? sampleAnswers
        : JSON.stringify(sampleAnswers);
    sampleSection = `
CÂU TRẢ LỜI MẪU từ Knowledge Base (dùng để SO SÁNH):
${samples}

So sánh câu trả lời ứng viên với các mẫu good/medium/bad để đánh giá chính xác hơn.
`;
  }

  let rubricSection = "";
  if (scoringRubric) {
    const rubric =
      typeof scoringRubric === "string"
        ? scoringRubric
        : JSON.stringify(scoringRubric);
    rubricSection = `
RUBRIC CHẤM ĐIỂM cho câu hỏi này:
${rubric}
`;
  }

  let categorySection = "";
  if (categoryRubric) {
    const catRubric =
      typeof categoryRubric === "string"
        ? categoryRubric
        : JSON.stringify(categoryRubric);
    categorySection = `
TIÊU CHÍ ĐÁNH GIÁ cho category "${category}":
${catRubric}
`;
  }

  return `Bạn là chuyên gia đánh giá phỏng vấn. Chấm điểm lượt trả lời này.

Câu hỏi: ${question}
Nhóm: ${category}
Độ khó: ${difficulty}
Câu trả lời ứng viên: ${answer}
${sampleSection}${rubricSection}${categorySection}
Đánh giá trên các khía cạnh:
1. Mức độ liên quan và đầy đủ (có trả lời đúng câu hỏi không?)
2. Chiều sâu và cụ thể (có ví dụ cụ thể, không chung chung)
3. Phương pháp STAR (cho câu behavioral: Tình huống, Nhiệm vụ, Hành động, Kết quả)
4. Chỉ số tự tin (từ đệm như "ờ", "ừm", ngôn ngữ do dự giảm điểm tự tin)
5. So sánh với câu trả lời mẫu (nếu có)

Return a JSON object:
{
  "questionIndex": 0,
  "score": number (0-10),
  "feedback": string (feedback cụ thể, actionable, bằng tiếng Việt),
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
