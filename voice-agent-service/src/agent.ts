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
    await fetch(`${CORE_BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      const parsed = SessionConfigSchema.parse(msg);
      sessionId = parsed.sessionId;

      logger.info({ sessionId }, "Starting interview session");

      // Build question list
      const questions: ParsedQuestion[] =
        parsed.questionPlan?.questions && parsed.questionPlan.questions.length > 0
          ? parsed.questionPlan.questions
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
              "=== PHONG CÁCH ===",
              "- Giọng nói thân thiện nhưng chuyên nghiệp, không quá trang trọng cũng không quá suồng sã.",
              '- Lắng nghe kỹ trước khi phản hồi.',
              '- Khi ứng viên trả lời tốt: khen ngắn gọn (VD: "Hay đấy", "Cảm ơn bạn đã chia sẻ chi tiết").',
              '- Khi ứng viên trả lời chung chung: hỏi follow-up để đào sâu (VD: "Bạn có thể cho ví dụ cụ thể hơn không?", "Kết quả cụ thể là gì?").',
              "- Mỗi câu hỏi chỉ follow-up tối đa 1-2 lần rồi chuyển câu tiếp.",
              "- KHÔNG giảng giải dài dòng. KHÔNG đưa ra đáp án mẫu.",
              "",
              "=== KỊCH BẢN PHỎNG VẤN ===",
              "Hỏi lần lượt các câu sau (chuyển câu khi đã đủ thông tin):",
              questionList,
              "",
              "=== QUY TẮC ===",
              '1. Bắt đầu bằng lời chào và giới thiệu ngắn: "Xin chào, mình là Minh từ InterviewPro..."',
              "2. Sau mỗi câu trả lời, phản hồi ngắn (1-2 câu) rồi hỏi câu tiếp theo.",
              "3. Nếu ứng viên hỏi lại, trả lời ngắn gọn rồi quay lại kịch bản.",
              "4. Khi hết câu hỏi, tổng kết: cảm ơn ứng viên, nói rằng kết quả sẽ được gửi sớm.",
              "5. Giữ nhịp tự nhiên — không đọc câu hỏi như robot.",
              "6. Thời lượng mỗi câu: khoảng 2-3 phút.",
              "7. Sử dụng follow-up gợi ý khi ứng viên trả lời chưa đủ chi tiết.",
            ].join("\n")
          : [
              "You are a professional HR interviewer conducting a 1:1 interview.",
              "Ask the following questions in order:",
              questionList,
              "Follow up if answers are vague. Be friendly but professional.",
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

          // Speech metrics for user transcripts
          if (speaker === "user" && isFinal && text.trim()) {
            const words = text.trim().split(/\s+/).filter(Boolean);
            const wpm =
              utteranceSeconds > 0 ? (words.length / utteranceSeconds) * 60 : null;
            const filler = countVietnameseFillers(text);

            logger.info(
              JSON.stringify({
                type: "SPEECH_METRICS",
                sessionId,
                wpm,
                filler,
                utteranceSeconds,
                transcript: text,
              }),
            );
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
