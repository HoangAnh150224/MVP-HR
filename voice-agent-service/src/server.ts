import express from "express";
import http from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { config } from "./config/config.js";
import { handleBrowserConnection } from "./agent.js";
import pino from "pino";

const logger = pino({ name: "server" });

const app = express();
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "voice-agent-service" });
});

// Internal endpoint: start a session (called by core-backend)
// This is informational — the actual session starts when the browser connects via WebSocket
app.post("/internal/start-session", (req, res) => {
  const { sessionId, metadata } = req.body;
  logger.info({ sessionId }, "Session start requested by core-backend");
  // Session metadata will be sent by browser via WebSocket config message
  res.json({ status: "ready", sessionId, wsUrl: `ws://localhost:${config.port}/ws/interview` });
});

const server = http.createServer(app);

// WebSocket server for browser audio connections
const wss = new WebSocketServer({ server, path: "/ws/interview" });

wss.on("connection", (ws: WebSocket, req) => {
  logger.info({ remoteAddress: req.socket.remoteAddress }, "New browser WebSocket connection");
  handleBrowserConnection(ws);
});

wss.on("error", (err) => {
  logger.error({ err: err.message }, "WebSocket server error");
});

server.listen(config.port, () => {
  logger.info({ port: config.port }, "Voice Agent Service started");
  logger.info(`  Health: http://localhost:${config.port}/health`);
  logger.info(`  WebSocket: ws://localhost:${config.port}/ws/interview`);
  logger.info(`  Internal API: http://localhost:${config.port}/internal/start-session`);
});
