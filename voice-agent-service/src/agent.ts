import WebSocket from "ws";
import { z } from "zod";
import pino from "pino";
import { GeminiLiveSession } from "./geminiLive.js";
import { config } from "./config/config.js";

const logger = pino({ name: "agent" });

const CORE_BACKEND_URL = config.coreBackend.url;

/** Fire-and-forget HTTP POST to core-backend. Never throws. */
async function postToCore(path: string, body: object): Promise<void> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (config.internalApiKey) {
      headers["X-Internal-Api-Key"] = config.internalApiKey;
    }
    await fetch(`${CORE_BACKEND_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    logger.warn({ err, path }, "Failed to POST to core-backend (non-blocking)");
  }
}

const QuestionSchema = z.object({
  index: z.number().optional(),
  category: z.string().optional(),
  topic: z.string().optional(),
  mainQuestion: z.string(),
  followUps: z.array(z.string()).optional(),
  id: z.string().optional(),
  text: z.string().optional(),
});

const SessionConfigSchema = z.object({
  sessionId: z.string(),
  locale: z.string().optional().default("vi"),
  questionPlan: z
    .object({
      targetRole: z.string().optional(),
      difficulty: z.string().optional(),
      questions: z.array(QuestionSchema).optional(),
    })
    .optional(),
});

// ── Kịch bản phỏng vấn mặc định (6 câu, ~15-20 phút) ──
const DEFAULT_QUESTIONS = [
  {
    id: "q1",
    category: "Giới thiệu",
    mainQuestion:
      "Bạn hãy giới thiệu ngắn gọn về bản thân, kinh nghiệm làm việc và lý do bạn quan tâm đến vị trí này.",
    followUps: ["Bạn có thể nói rõ hơn về kinh nghiệm gần nhất không?"],
  },
  {
    id: "q2",
    category: "Kinh nghiệm",
    mainQuestion:
      "Hãy kể về một dự án mà bạn tự hào nhất. Bạn đảm nhận vai trò gì, gặp khó khăn gì và kết quả cuối cùng ra sao?",
    followUps: ["Kết quả cụ thể là gì? Có số liệu nào không?"],
  },
  {
    id: "q3",
    category: "Kỹ thuật",
    mainQuestion:
      "Khi bạn gặp một bug nghiêm trọng trên production mà chưa rõ nguyên nhân, quy trình xử lý của bạn như thế nào từ khi phát hiện đến khi fix xong?",
    followUps: ["Bạn dùng công cụ gì để debug?"],
  },
  {
    id: "q4",
    category: "Tình huống",
    mainQuestion:
      "Bạn hãy kể về một lần bạn không đồng ý với quyết định kỹ thuật của team lead hoặc đồng nghiệp. Bạn đã xử lý tình huống đó như thế nào?",
    followUps: ["Kết quả cuối cùng thế nào?"],
  },
  {
    id: "q5",
    category: "Tư duy",
    mainQuestion:
      "Nếu được giao thiết kế một hệ thống từ đầu cho một ứng dụng có khoảng 10.000 người dùng đồng thời, bạn sẽ chọn công nghệ và kiến trúc như thế nào? Giải thích lý do.",
    followUps: ["Bạn sẽ xử lý vấn đề scaling thế nào?"],
  },
  {
    id: "q6",
    category: "Kết thúc",
    mainQuestion:
      "Bạn có câu hỏi nào muốn hỏi ngược lại cho phía công ty không? Hoặc có điều gì bạn muốn bổ sung thêm?",
    followUps: [],
  },
];

type ParsedQuestion = z.infer<typeof QuestionSchema>;

function getQuestionText(q: ParsedQuestion): string {
  return q.mainQuestion || q.text || "";
}

function getQuestionCategory(q: ParsedQuestion): string {
  return q.category || "Câu";
}

function countVietnameseFillers(text: string): Record<string, number> {
  const fillers = [
    "ờ", "à", "ừ", "ừm", "ờm", "kiểu", "như là",
    "nói chung", "thì", "cái này", "đại loại",
  ];
  const lower = text.toLowerCase();
  const out: Record<string, number> = {};
  for (const f of fillers) {
    const re = new RegExp(`(^|\\s)${escapeRegExp(f)}(\\s|$)`, "g");
    const matches = lower.match(re);
    if (matches && matches.length) out[f] = matches.length;
  }
  return out;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Handle a single browser WebSocket connection.
 * Acts as a proxy between the browser and Gemini Multimodal Live API.
 *
 * Protocol from browser:
 *   { type: "config", sessionId, metadata }  — start session
 *   { type: "audio", data: "<base64 PCM>" }  — audio chunk
 *   { type: "end" }                           — end session
 *
 * Protocol to browser:
 *   { type: "audio", data: "<base64 PCM>" }
 *   { type: "transcript", speaker: "ai"|"user", text }
 *   { type: "status", state: "connected"|"speaking"|"listening" }
 *   { type: "error", message }
 */
export function handleBrowserConnection(browserWs: WebSocket): void {
  let geminiSession: GeminiLiveSession | null = null;
  let sessionId: string | null = null;
  let lastUserSpeechStart: number | null = null;
  let utteranceSeconds = 0;
  let turnIndex = 0;

  const sendToBrowser = (msg: object) => {
    if (browserWs.readyState === WebSocket.OPEN) {
      browserWs.send(JSON.stringify(msg));
    }
  };

  browserWs.on("message", (data: WebSocket.Data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case "config":
          handleConfig(msg);
          break;
        case "audio":
          handleAudio(msg);
          break;
        case "end":
          handleEnd();
          break;
        default:
          logger.warn({ type: msg.type }, "Unknown message type from browser");
      }
    } catch (err) {
      logger.error({ err }, "Failed to parse browser message");
      sendToBrowser({ type: "error", message: "Invalid message format" });
    }
  });

  browserWs.on("close", () => {
    logger.info({ sessionId }, "Browser disconnected");
    geminiSession?.close();
  });

  browserWs.on("error", (err) => {
    logger.error({ err: err.message, sessionId }, "Browser WebSocket error");
    geminiSession?.close();
  });

  function handleConfig(msg: any): void {
    try {
      // Handle double-serialized questionPlan (string instead of object)
      if (msg.questionPlan && typeof msg.questionPlan === "string") {
        try {
          msg.questionPlan = JSON.parse(msg.questionPlan);
          logger.info("Parsed double-serialized questionPlan from string");
        } catch {
          logger.warn("Failed to parse questionPlan string, will use defaults");
          delete msg.questionPlan;
        }
      }

      const parsed = SessionConfigSchema.parse(msg);
      sessionId = parsed.sessionId;

      const hasCustomQuestions =
        parsed.questionPlan?.questions && parsed.questionPlan.questions.length > 0;

      logger.info(
        {
          sessionId,
          hasQuestionPlan: !!parsed.questionPlan,
          questionCount: parsed.questionPlan?.questions?.length ?? 0,
          usingDefaults: !hasCustomQuestions,
          targetRole: parsed.questionPlan?.targetRole ?? "none",
        },
        "Starting interview session",
      );

      // Build question list
      const questions: ParsedQuestion[] = hasCustomQuestions
        ? parsed.questionPlan!.questions!
        : DEFAULT_QUESTIONS;

      const questionList = questions
        .map((q, i) => {
          const category = getQuestionCategory(q);
          const text = getQuestionText(q);
          const followUps =
            q.followUps && q.followUps.length > 0
              ? `\n     Follow-ups: ${q.followUps.join(" / ")}`
              : "";
          return `  ${i + 1}. [${category}] ${text}${followUps}`;
        })
        .join("\n");

      const instructions =
        parsed.locale === "vi"
          ? [
              "=== VAI TRÒ ===",
              "Bạn là một HR Interviewer chuyên nghiệp đang phỏng vấn 1:1 bằng tiếng Việt.",
              "Tên bạn là Minh, từ phòng Nhân sự của công ty InterviewPro.",
              "",
              "=== NGUYÊN TẮC QUAN TRỌNG NHẤT ===",
              "- PHẢI ĐỢI ứng viên trả lời XONG rồi mới nói tiếp. TUYỆT ĐỐI KHÔNG hỏi câu tiếp khi ứng viên chưa trả lời.",
              "- Sau khi hỏi một câu, IM LẶNG và CHỜ cho đến khi ứng viên trả lời xong hoàn toàn.",
              "- Nếu ứng viên im lặng lâu (>5 giây), nhẹ nhàng nhắc: 'Bạn cứ từ từ suy nghĩ nhé' — KHÔNG hỏi câu khác.",
              "",
              "=== PHONG CÁCH ===",
              "- Giọng nói thân thiện nhưng chuyên nghiệp.",
              '- Lắng nghe kỹ TOÀN BỘ câu trả lời trước khi phản hồi.',
              '- Khi ứng viên trả lời tốt: khen ngắn gọn (VD: "Hay đấy", "Cảm ơn bạn đã chia sẻ").',
              "- KHÔNG giảng giải dài dòng. KHÔNG đưa ra đáp án mẫu.",
              "",
              "=== CÁCH ĐÀO SÂU KINH NGHIỆM ===",
              "Khi ứng viên kể về kinh nghiệm hoặc dự án, BẮT BUỘC phải đào sâu bằng cách:",
              "1. Đưa ra TÌNH HUỐNG CỤ THỂ dựa trên kinh nghiệm họ vừa nói.",
              '   VD: Ứng viên nói "Em làm về REST API" → Hỏi "Giả sử API của bạn đang xử lý 1000 request/giây và bắt đầu timeout, bạn sẽ xử lý thế nào?"',
              '   VD: Ứng viên nói "Em dùng React" → Hỏi "Nếu component render lại liên tục gây lag, bạn sẽ debug và optimize bằng cách nào?"',
              '   VD: Ứng viên nói "Em làm team lead" → Hỏi "Nếu có 2 thành viên trong team xung đột về cách thiết kế database, bạn sẽ giải quyết ra sao?"',
              "2. Hỏi về KẾT QUẢ CỤ THỂ: số liệu, impact, bài học rút ra.",
              "3. Hỏi về KHÓ KHĂN gặp phải và cách GIẢI QUYẾT.",
              "4. Chỉ chuyển sang câu tiếp khi đã khai thác đủ sâu (2-3 follow-up).",
              "",
              "=== KỊCH BẢN PHỎNG VẤN ===",
              "Hỏi lần lượt các câu sau:",
              questionList,
              "",
              "=== QUY TẮC ===",
              '1. Bắt đầu bằng lời chào ngắn: "Xin chào, mình là Minh từ InterviewPro. Hôm nay mình sẽ trao đổi với bạn khoảng 15-20 phút nhé. Bạn sẵn sàng chưa?"',
              "2. CHỜ ứng viên xác nhận sẵn sàng rồi mới bắt đầu câu hỏi đầu tiên.",
              "3. Mỗi câu hỏi: HỎI → CHỜ TRẢ LỜI → ĐÀO SÂU bằng tình huống → CHỜ TRẢ LỜI → rồi mới chuyển câu.",
              "4. KHÔNG BAO GIỜ hỏi 2 câu liên tiếp mà không chờ trả lời.",
              "5. Khi hết câu hỏi, tổng kết: cảm ơn và nói kết quả sẽ gửi sớm.",
              "6. Giữ nhịp tự nhiên — không đọc câu hỏi như robot.",
            ].join("\n")
          : [
              "You are a professional HR interviewer conducting a 1:1 interview.",
              "",
              "CRITICAL RULES:",
              "- ALWAYS wait for the candidate to finish answering before asking the next question.",
              "- NEVER ask two questions in a row without waiting for an answer.",
              "- When the candidate shares experience, dig deeper with SCENARIO-BASED follow-ups based on what they said.",
              "- Example: Candidate says 'I worked with microservices' → Ask 'If one of your microservices starts failing and cascading to others, how would you handle it?'",
              "",
              "Ask the following questions in order:",
              questionList,
              "",
              "For each answer: LISTEN → ACKNOWLEDGE → DIG DEEPER with a scenario → WAIT → then move to next question.",
            ].join("\n");

      // Create Gemini Live session
      geminiSession = new GeminiLiveSession({
        onAudio: (base64Audio) => {
          sendToBrowser({ type: "audio", data: base64Audio });
        },
        onTranscript: (speaker, text, isFinal) => {
          sendToBrowser({ type: "transcript", speaker, text, isFinal });

          // Save final transcripts to core-backend
          if (isFinal && text.trim() && sessionId) {
            const currentTurn = turnIndex++;
            postToCore("/internal/transcripts", {
              sessionId,
              turnIndex: currentTurn,
              speaker,
              text: text.trim(),
              timestampMs: Date.now(),
            });
          }

          // Speech metrics for user transcripts — calculate per-turn and POST to core-backend
          if (speaker === "user" && isFinal && text.trim()) {
            // Calculate per-turn utterance duration
            let turnUtterance = utteranceSeconds;
            if (lastUserSpeechStart) {
              turnUtterance = (Date.now() - lastUserSpeechStart) / 1000;
              lastUserSpeechStart = null;
              utteranceSeconds = 0;
            }

            const words = text.trim().split(/\s+/).filter(Boolean);
            const wpm =
              turnUtterance > 0 ? (words.length / turnUtterance) * 60 : null;
            const filler = countVietnameseFillers(text);

            logger.info(
              {
                type: "SPEECH_METRICS",
                sessionId,
                turnIndex: currentTurn,
                wpm,
                filler,
                utteranceSeconds: turnUtterance,
              },
              "Speech metrics for turn",
            );

            // POST to core-backend for storage
            if (sessionId) {
              postToCore("/internal/speech-metrics", {
                sessionId,
                turnIndex: currentTurn,
                wpm,
                fillerCounts: filler,
                utteranceSeconds: turnUtterance,
              });
            }
          }
        },
        onError: (message) => {
          sendToBrowser({ type: "error", message });
        },
        onClose: () => {
          sendToBrowser({
            type: "status",
            state: "disconnected",
          });
        },
      });

      geminiSession.connect(instructions, "Puck");
      sendToBrowser({ type: "status", state: "connected" });

      // Notify core-backend that session is LIVE
      postToCore(`/internal/sessions/${sessionId}/status`, { state: "LIVE" });
    } catch (err: any) {
      logger.error({ err: err.message }, "Failed to handle config");
      sendToBrowser({ type: "error", message: "Invalid session config" });
    }
  }

  function handleAudio(msg: any): void {
    if (!geminiSession?.isConnected) {
      return;
    }

    // Track speech timing for metrics
    if (!lastUserSpeechStart) {
      lastUserSpeechStart = Date.now();
    }

    geminiSession.sendAudio(msg.data);
  }

  function handleEnd(): void {
    logger.info({ sessionId }, "Session ending");

    // Calculate final utterance duration
    if (lastUserSpeechStart) {
      utteranceSeconds = (Date.now() - lastUserSpeechStart) / 1000;
      lastUserSpeechStart = null;
    }

    geminiSession?.close();
    sendToBrowser({ type: "status", state: "ended" });

    // Notify core-backend that session is ENDED
    if (sessionId) {
      postToCore(`/internal/sessions/${sessionId}/status`, { state: "ENDED" });
    }
  }
}
