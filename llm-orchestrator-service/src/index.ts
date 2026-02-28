import express from "express";
import { config } from "./config/config.js";
import profileRoutes from "./routes/profileRoutes.js";
import questionPlanRoutes from "./routes/questionPlanRoutes.js";
import scoringRoutes from "./routes/scoringRoutes.js";

const app = express();

app.use(express.json({ limit: "10mb" }));

// Routes
app.use(profileRoutes);
app.use(questionPlanRoutes);
app.use(scoringRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: err.message },
    });
  },
);

app.listen(config.port, () => {
  console.log(`LLM Orchestrator Service listening on port ${config.port}`);
});
