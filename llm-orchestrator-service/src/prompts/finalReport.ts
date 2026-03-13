interface ScoringRubric {
  name: string;
  slug: string;
  weightPercent: number;
  description?: string;
  scoreLevels?: string;
}

interface RoleContext {
  name: string;
  description?: string;
  typicalSkills?: string;
}

export function finalReportPrompt(
  targetRole: string,
  turns: {
    question: string;
    answer: string;
    score: number;
    category: string;
  }[],
  speechMetrics?: {
    avgWpm: number;
    totalFillers: number;
    topFillers: Record<string, number>;
    totalUtteranceSeconds: number;
  },
  visionMetrics?: {
    eyeContactPercent: number;
    postureWarnings: number;
    avgSentiment: number;
    expressionBreakdown?: Record<string, number>;
    expressionWarnings?: number;
  },
  scoringRubrics?: ScoringRubric[],
  roleContext?: RoleContext,
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
    let expressionText = "";
    if (visionMetrics.expressionBreakdown) {
      const eb = visionMetrics.expressionBreakdown;
      expressionText = `
- Facial Expression Breakdown: Happy ${eb.happy ?? 0}%, Neutral ${eb.neutral ?? 0}%, Surprised ${eb.surprised ?? 0}%, Concerned ${eb.concerned ?? 0}%, Confused ${eb.confused ?? 0}%
- Expression warnings triggered: ${visionMetrics.expressionWarnings ?? 0}
  (Ghi chú: Happy cao = tự tin, thoải mái. Concerned/Confused cao = lo lắng, thiếu tự tin. Neutral quá cao = thiếu nhiệt tình)`;
    }
    visionSection = `
Body Language Metrics:
- Eye contact: ${visionMetrics.eyeContactPercent}%
- Posture warnings: ${visionMetrics.postureWarnings}
- Average sentiment: ${visionMetrics.avgSentiment}${expressionText}
`;
  }

  let rubricsSection = "";
  if (scoringRubrics && scoringRubrics.length > 0) {
    const rubricText = scoringRubrics
      .map(
        (r) =>
          `  - ${r.name} (${r.slug}): trọng số ${r.weightPercent}% — ${r.description || ""}`,
      )
      .join("\n");
    rubricsSection = `
5 TIÊU CHÍ ĐÁNH GIÁ CHÍNH THỨC (từ Knowledge Base):
${rubricText}

BẮT BUỘC: Dùng đúng 5 tiêu chí trên cho categories trong report.
Mỗi category phải có score tính theo trọng số (weightPercent).
`;
  }

  let roleSection = "";
  if (roleContext) {
    roleSection = `
Thông tin vị trí:
- Tên: ${roleContext.name}
- Mô tả: ${roleContext.description || "N/A"}
- Kỹ năng phổ biến: ${roleContext.typicalSkills || "N/A"}
`;
  }

  return `Bạn là chuyên gia coaching phỏng vấn, tạo báo cáo đánh giá chi tiết bằng tiếng Việt.

Vị trí ứng tuyển: ${targetRole}
${roleSection}
Các lượt phỏng vấn:
${turnsText}
${speechSection}${visionSection}${rubricsSection}
Tạo báo cáo chi tiết với:
1. Điểm tổng (0-100) — tính dựa trên trọng số 5 tiêu chí
2. Điểm theo từng tiêu chí (Sự tự tin 20%, Giao tiếp 25%, GQVĐ 20%, Chuyên môn 25%, Thái độ 10%)
   Mỗi tiêu chí cần: điểm mạnh, điểm yếu, mẹo cải thiện
3. Điểm chi tiết từng lượt:
   - Phân tích STAR (components thiếu + gợi ý bổ sung)
   - Câu trả lời mẫu (sampleAnswer) bằng tiếng Việt, 3-5 câu, dùng STAR nếu phù hợp
4. Top 3 điểm mạnh nổi bật
5. Gợi ý cải thiện cụ thể (không chung chung, phải có ví dụ)
6. Nhận xét về giọng nói (nếu có speech metrics)
7. Nhận xét về ngôn ngữ cơ thể (nếu có vision metrics):
   - Phân tích biểu cảm khuôn mặt dựa trên expression breakdown
   - Happy cao → đánh giá cao "Sự tự tin" và "Thái độ"
   - Concerned/Confused cao → trừ điểm "Sự tự tin", gợi ý cải thiện
   - Neutral quá cao (>70%) → nhận xét thiếu nhiệt tình, gợi ý mỉm cười nhiều hơn

Return a JSON object:
{
  "overallScore": number (0-100),
  "categories": [
    {
      "name": string (tên tiêu chí tiếng Việt),
      "slug": string,
      "score": number (0-100),
      "maxScore": 100,
      "weightPercent": number,
      "feedback": string,
      "strengths": string (điểm mạnh),
      "weaknesses": string (điểm yếu),
      "tips": string (mẹo cải thiện)
    }
  ],
  "turnScores": [
    {
      "questionIndex": number,
      "score": number (0-10),
      "feedback": string,
      "confidenceScore": number (0-1),
      "starComponents": { "situation": bool, "task": bool, "action": bool, "result": bool },
      "starAnalysis": {
        "missing": string[],
        "suggestion": string (Vietnamese)
      },
      "sampleAnswer": string (Vietnamese, 3-5 sentences)
    }
  ],
  "strengths": string[],
  "improvements": [
    {
      "area": string,
      "currentLevel": string,
      "suggestion": string,
      "example": string
    }
  ],
  "speechFeedback": string | null,
  "visionFeedback": string | null
}

Return ONLY valid JSON, no markdown fences.`;
}
