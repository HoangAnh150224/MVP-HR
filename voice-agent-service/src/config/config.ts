export const config = {
  port: parseInt(process.env.PORT || "8081", 10),
  coreBackend: {
    url: process.env.CORE_BACKEND_URL || "http://localhost:8080",
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_LIVE_MODEL || "gemini-2.5-flash-exp-native-audio-thinking-dialog",
  },
};
