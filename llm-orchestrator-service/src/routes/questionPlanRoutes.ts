import { Router } from "express";
import { callGemini, parseJsonResponse } from "../services/geminiService.js";
import { generatePlanPrompt } from "../prompts/generatePlan.js";
import { questionPlanSchema } from "../schemas/questionPlan.schema.js";

const router = Router();

router.post("/internal/question-plans/generate", async (req, res, next) => {
  try {
    const { cvProfile, targetRole, difficulty } = req.body;

    if (!targetRole) {
      res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "targetRole is required" },
      });
      return;
    }

    // Use provided CV profile or a default one
    const profile = cvProfile || {
      name: "Candidate",
      targetRole,
      yearsExperience: 2,
      skills: ["general"],
      strengths: ["communication"],
      gaps: ["to be assessed"],
    };

    const prompt = generatePlanPrompt(profile, difficulty || "mid");
    const raw = await callGemini(prompt);
    const parsed = parseJsonResponse(raw);
    const plan = questionPlanSchema.parse(parsed);

    res.json(plan);
  } catch (error) {
    next(error);
  }
});

export default router;
