import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/config.js";

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

const MAX_RETRIES = 3;
const RETRY_DELAYS = [15_000, 30_000, 45_000];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: config.gemini.model });

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      });

      return result.response.text();
    } catch (err: any) {
      const isRateLimit =
        err?.status === 429 ||
        err?.message?.includes("429") ||
        err?.message?.includes("quota");

      if (isRateLimit && attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS[attempt];
        console.warn(
          `Gemini rate limited (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay / 1000}s...`,
        );
        await sleep(delay);
        continue;
      }

      throw err;
    }
  }

  throw new Error("Gemini: max retries exceeded");
}

export function parseJsonResponse<T>(text: string): T {
  // Strip markdown fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}
