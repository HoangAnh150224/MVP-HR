import { Router } from "express";
import { callGemini, parseJsonResponse } from "../services/geminiService.js";
import { extractProfilePrompt } from "../prompts/extractProfile.js";
import { cvProfileSchema } from "../schemas/cvProfile.schema.js";

const router = Router();

router.post("/internal/cv-profiles/parse", async (req, res, next) => {
  try {
    const { cvText, targetRole } = req.body;

    if (!cvText || !targetRole) {
      res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "cvText and targetRole are required" },
      });
      return;
    }

    const prompt = extractProfilePrompt(cvText, targetRole);
    const raw = await callGemini(prompt);
    const parsed = parseJsonResponse(raw);
    const profile = cvProfileSchema.parse(parsed);

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

export default router;
