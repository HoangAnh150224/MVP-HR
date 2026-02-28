import { Router } from "express";
import { callGemini, parseJsonResponse } from "../services/geminiService.js";
import { scoreTurnPrompt } from "../prompts/scoreTurn.js";
import { finalReportPrompt } from "../prompts/finalReport.js";
import { turnScoreSchema } from "../schemas/score.schema.js";
import { reportSchema } from "../schemas/report.schema.js";

const router = Router();

router.post("/internal/scoring/turn", async (req, res, next) => {
  try {
    const { question, answer, category, difficulty } = req.body;

    if (!question || !answer) {
      res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "question and answer are required" },
      });
      return;
    }

    const prompt = scoreTurnPrompt(
      question,
      answer,
      category || "general",
      difficulty || "mid",
    );
    const raw = await callGemini(prompt);
    const parsed = parseJsonResponse(raw);
    const score = turnScoreSchema.parse(parsed);

    res.json(score);
  } catch (error) {
    next(error);
  }
});

router.post("/internal/scoring/final", async (req, res, next) => {
  try {
    const { targetRole, turns } = req.body;

    if (!targetRole || !turns) {
      res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "targetRole and turns are required" },
      });
      return;
    }

    const prompt = finalReportPrompt(targetRole, turns);
    const raw = await callGemini(prompt);
    const parsed = parseJsonResponse(raw);
    const report = reportSchema.parse(parsed);

    res.json(report);
  } catch (error) {
    next(error);
  }
});

export default router;
