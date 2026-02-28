import WebSocket from "ws";
import { config } from "./config/config.js";
import pino from "pino";

const logger = pino({ name: "gemini-live" });

export interface GeminiLiveCallbacks {
  onAudio: (base64Audio: string) => void;
  onTranscript: (speaker: "ai" | "user", text: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

/**
 * Wrapper for Gemini Multimodal Live API over WebSocket.
 *
 * Protocol:
 *   - Setup message → configure model, voice, system instructions
 *   - Client sends audio via clientContent.realtimeInput
 *   - Server responds with serverContent (audio + transcript)
 */
export class GeminiLiveSession {
  private ws: WebSocket | null = null;
  private callbacks: GeminiLiveCallbacks;
  private setupDone = false;

  constructor(callbacks: GeminiLiveCallbacks) {
    this.callbacks = callbacks;
  }

  connect(instructions: string, voice: string = "Puck"): void {
    const apiKey = config.gemini.apiKey;
    const model = config.gemini.model;

    if (!apiKey) {
      this.callbacks.onError("GEMINI_API_KEY is not configured");
      return;
    }

    const url =
      `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent` +
      `?key=${apiKey}`;

    logger.info({ model, voice }, "Connecting to Gemini Live API");

    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      logger.info("Gemini Live WebSocket connected");
      this.sendSetup(instructions, voice, model);
    });

    this.ws.on("message", (data: WebSocket.Data) => {
      try {
        const raw = data.toString();
        const msg = JSON.parse(raw);
        this.handleMessage(msg);
      } catch (err) {
        logger.error({ err }, "Failed to parse Gemini message");
      }
    });

    this.ws.on("error", (err) => {
      logger.error({ err: err.message }, "Gemini WebSocket error");
      this.callbacks.onError(err.message);
    });

    this.ws.on("close", (code, reason) => {
      logger.info({ code, reason: reason.toString() }, "Gemini WebSocket closed");
      this.callbacks.onClose();
    });
  }

  private sendSetup(instructions: string, voice: string, model: string): void {
    const setupMessage = {
      setup: {
        model: `models/${model}`,
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice,
              },
            },
          },
          temperature: 0.7,
        },
        systemInstruction: {
          parts: [{ text: instructions }],
        },
      },
    };

    this.ws?.send(JSON.stringify(setupMessage));
    this.setupDone = true;
    logger.info("Sent setup message to Gemini");
  }

  sendAudio(base64Pcm: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.setupDone) {
      return;
    }

    const msg = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: "audio/pcm;rate=16000",
            data: base64Pcm,
          },
        ],
      },
    };

    this.ws.send(JSON.stringify(msg));
  }

  private handleMessage(msg: any): void {
    // Setup complete acknowledgment
    if (msg.setupComplete) {
      logger.info("Gemini setup complete, sending prompt to trigger greeting");
      // Send a text turn to prompt Gemini to start the interview
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          clientContent: {
            turns: [{ role: "user", parts: [{ text: "Xin chào, tôi đã sẵn sàng cho buổi phỏng vấn." }] }],
            turnComplete: true,
          },
        }));
      }
      return;
    }

    // Server content — audio and/or transcript
    if (msg.serverContent) {
      const content = msg.serverContent;

      // Model turn with parts (audio only — text parts are model "thinking", not spoken)
      if (content.modelTurn?.parts) {
        for (const part of content.modelTurn.parts) {
          // Audio response
          if (part.inlineData?.mimeType?.startsWith("audio/")) {
            this.callbacks.onAudio(part.inlineData.data);
          }
          // Note: part.text is model thinking/planning, not spoken text.
          // Actual spoken text arrives via outputTranscript.
        }
      }

      // Input transcript (user speech recognized by Gemini)
      if (content.inputTranscript) {
        this.callbacks.onTranscript("user", content.inputTranscript, true);
      }

      // Output transcript (AI speech text)
      if (content.outputTranscript) {
        this.callbacks.onTranscript("ai", content.outputTranscript, true);
      }

      // Turn complete
      if (content.turnComplete) {
        // Turn is done, no action needed
      }

      return;
    }

    // Tool calls (not used in MVP but log for debugging)
    if (msg.toolCall) {
      logger.warn({ toolCall: msg.toolCall }, "Unexpected tool call from Gemini");
      return;
    }
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setupDone = false;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.setupDone;
  }
}
