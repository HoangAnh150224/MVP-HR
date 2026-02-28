export const config = {
  port: parseInt(process.env.PORT || "8082", 10),
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  },
};
