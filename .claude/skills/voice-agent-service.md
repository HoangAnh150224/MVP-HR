# Skill: voice-agent-service (WebSocket Audio Proxy / AI Interviewer)

## Service Description
**Stack**: Node.js, TypeScript, Express, ws, Gemini Multimodal Live API (audio-to-audio)
**Port**: 8081
**Path**: `voice-agent-service/`

The voice-agent-service is a WebSocket audio proxy that acts as the AI interviewer. It receives the candidate's audio from the browser via WebSocket, forwards it to Gemini Multimodal Live API, and relays audio responses back to the browser. It also tracks speech metrics and manages question flow.

## When to Use This Skill
- Modifying the WebSocket audio proxy logic
- Working with Gemini Multimodal Live API integration
- Implementing speech metrics (WPM, filler words)
- Question tracking and coverage logic
- Audio format handling (PCM 16-bit)

## Folder Structure
```
voice-agent-service/src/
├── server.ts            # Express + WebSocket server entry point
├── agent.ts             # Browser connection handler, interview flow
├── geminiLive.ts        # Gemini Multimodal Live API WebSocket wrapper
├── config/
│   └── config.ts        # Environment config
└── types/
    └── index.ts         # Shared types
```

## Conventions

### WebSocket Protocol (Browser ↔ Service)
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

### Gemini Live API Connection
```typescript
// WebSocket URL: wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=API_KEY
// Messages: setup, realtimeInput (audio), serverContent (response audio + transcript)
```

### Audio Formats
- Input from browser: PCM 16-bit, 16kHz, mono (base64)
- Output from Gemini: PCM 16-bit, 24kHz, mono (base64)

## Key Dependencies
```json
{
  "ws": "^8.18.0",
  "express": "^4.21.0",
  "@google/generative-ai": "^0.20.0"
}
```

## Agent Lifecycle
1. **Connect**: Browser opens WebSocket to `/ws/interview`
2. **Config**: Browser sends config message with sessionId and questionPlan
3. **Gemini Connect**: Service opens WebSocket to Gemini Live API with interview instructions
4. **Audio Loop**: Browser audio → Gemini → AI audio response → Browser
5. **End**: Browser sends end message, service closes Gemini connection

## Error Handling
- Gemini connection failure: send error message to browser
- Audio processing errors: log and skip, don't crash
- Browser disconnect: close Gemini session

## Testing
- Unit tests: Vitest for speech metrics, message parsing
- Integration tests: mock Gemini WebSocket, test full message flow
- Manual testing: connect via browser, verify audio round-trip
