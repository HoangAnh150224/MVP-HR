# InterviewPro - AI 1:1 Video Interview Mentor

## Architecture Overview

InterviewPro is a microservices-based AI interview coaching platform. A candidate uploads their CV, connects to a voice-agent via WebSocket, and practices with an AI interviewer (powered by Gemini Multimodal Live API) that asks role-specific questions, evaluates responses in real-time, and generates a detailed improvement report.

### Service Map

```
┌────────────┐   REST/WS    ┌──────────────┐   HTTP         ┌─────────────────────┐
│  web-app   │◄────────────►│ core-backend  │◄──────────────►│ llm-orchestrator    │
│ (Next.js)  │              │ (Spring Boot) │               │ (Node.js/TS)        │
└─────┬──────┘              └──────────────┘               └─────────────────────┘
      │ WebSocket (audio)
      ▼
┌────────────────────┐   WebSocket    ┌───────────────────────┐
│ voice-agent-service│───────────────►│ Gemini Multimodal     │
│ (Node.js/TS proxy) │◄──────────────│ Live API              │
└────────────────────┘               └───────────────────────┘

┌────────────┐   WS (landmarks)   ┌──────────────────────────┐
│  web-app   │───────────────────►│ vision-analytics-service  │
│ (browser)  │◄───────────────────│ (Python/FastAPI)          │
└────────────┘   WS (warnings)    └──────────────────────────┘
```

### Communication Patterns

| From → To | Protocol | Purpose |
|-----------|----------|---------|
| web-app → core-backend | REST (HTTPS) | CRUD, auth, session management |
| core-backend → web-app | WebSocket | Real-time events (state changes, transcript) |
| web-app → voice-agent-service | WebSocket | Audio streaming (PCM 16-bit) |
| voice-agent-service → web-app | WebSocket | AI audio response + transcript |
| voice-agent-service ↔ Gemini Live API | WebSocket | Bidirectional audio-to-audio AI |
| core-backend → voice-agent-service | HTTP (internal) | Session start notification |
| core-backend → llm-orchestrator | HTTP (internal) | CV parsing, question plans, scoring |
| web-app → vision-analytics | WebSocket | Face landmarks streaming |
| vision-analytics → web-app | WebSocket | Warnings (eye contact, posture) |

### Audio Protocol (Browser ↔ voice-agent-service)

```json
// Browser → Service
{ "type": "config", "sessionId": "uuid", "locale": "vi", "questionPlan": {...} }
{ "type": "audio", "data": "<base64 PCM 16-bit 16kHz mono>" }
{ "type": "end" }

// Service → Browser
{ "type": "audio", "data": "<base64 PCM 16-bit 24kHz mono>" }
{ "type": "transcript", "speaker": "ai"|"user", "text": "...", "isFinal": true|false }
{ "type": "status", "state": "connected"|"speaking"|"listening"|"ended" }
{ "type": "error", "message": "..." }
```

### Standard Event Envelope

All core-backend WebSocket events follow this envelope format:

```json
{
  "type": "string",
  "sessionId": "uuid",
  "timestamp": "ISO-8601",
  "payload": {}
}
```

**Event Types:**
- `session.state_changed` — Session state transition
- `transcript.turn` — New transcript turn (speaker + text)
- `transcript.partial` — Partial transcript (real-time)
- `score.turn` — Per-turn score update
- `vision.warning` — Body language warning
- `agent.status` — Agent connection status
- `report.ready` — Final report generated

### Session State Machine

```
CREATED → CV_UPLOADING → CV_PARSED → CONSENT_PENDING → JOINING →
LIVE → WRAP_UP → ENDED → SCORING → REPORT_READY
```

## Project Conventions

### General
- **Language**: English for code, Vietnamese for user-facing content (vi-VN locale)
- **Branch naming**: `feat/<service>/<description>`, `fix/<service>/<description>`
- **Commit messages**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)

### Naming Conventions
| Context | Convention | Example |
|---------|-----------|---------|
| TypeScript files | camelCase | `sessionStore.ts` |
| React components | PascalCase | `VideoRoom.tsx` |
| Java classes | PascalCase | `SessionService.java` |
| Python files | snake_case | `signal_processor.py` |
| REST endpoints | kebab-case | `/api/v1/cv-profiles` |
| Event types | dot.notation | `session.state_changed` |
| Environment vars | UPPER_SNAKE | `GEMINI_API_KEY` |
| Database tables | snake_case | `cv_profiles` |

### API Versioning
- All REST APIs use `/api/v1/` prefix
- Internal service-to-service calls use `/internal/` prefix

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": []
  }
}
```

## Privacy & Security Rules

1. **Never log PII** (CV content, personal data) in plaintext
2. **JWT auth** on all REST endpoints (except health checks)
3. **WebSocket connections** must include valid JWT in handshake
4. **Gemini API key** stored server-side only (never exposed to browser)
5. **CV files** are stored encrypted at rest, deleted after parsing
6. **Consent gate** is mandatory before any recording/AI interaction
7. **CORS** restricted to known origins only
8. **Rate limiting** on all public endpoints

## Tech Stack Summary

| Service | Stack | Port (dev) |
|---------|-------|------------|
| web-app | Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui, Zustand | 3000 |
| core-backend | Spring Boot 3, Java 21, PostgreSQL, Redis, Flyway | 8080 |
| voice-agent-service | Node.js, TypeScript, Express, ws, Gemini Multimodal Live API | 8081 |
| llm-orchestrator-service | Node.js, TypeScript, Express, Gemini API, Zod | 8082 |
| vision-analytics-service | Python 3.12, FastAPI, MediaPipe (client-side), NumPy | 8083 |

## Docker

- `docker-compose.yml` at root orchestrates all services
- Each service has its own `Dockerfile`
- Shared network: `interviewpro-net`
- Volumes for PostgreSQL and Redis data persistence

## Development Workflow

1. Start infrastructure: `docker compose up redis postgres -d`
2. Start services individually for development with hot-reload
3. Use `.env.example` files as template for local `.env` files
