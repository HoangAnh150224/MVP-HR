# Skill: web-app (Next.js / React Frontend)

## Service Description
**Stack**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Zustand
**Port**: 3000
**Path**: `web-app/`

The web-app is the candidate-facing SPA. It handles authentication, CV upload, the audio interview room (via WebSocket to voice-agent-service), real-time transcript display, vision landmark capture (MediaPipe in-browser), and the post-interview report view.

## When to Use This Skill
- Creating or modifying React components, pages, or layouts
- Adding new routes in the Next.js App Router
- Working with audio WebSocket (voice-agent-service connection)
- Creating custom hooks (WebSocket, audio stream, session state)
- Zustand store modifications
- Styling with Tailwind / shadcn/ui components
- Client-side MediaPipe face landmark capture
- WebSocket event handling from core-backend

## Folder Structure
```
web-app/src/
├── app/              # Next.js App Router (pages & layouts)
│   ├── (auth)/       # Login, register
│   ├── (dashboard)/  # Dashboard, sessions, profile, settings
│   └── interview/    # Interview flow: upload → consent → room → report
├── components/
│   ├── ui/           # shadcn/ui base components
│   ├── interview/    # TranscriptPanel, AgentStateIndicator, VideoRoom, SessionStatus
│   ├── cv/           # CVUploader, CVProfilePreview
│   ├── report/       # ScoreBreakdown, ScoreComparison, ReportView
│   └── layout/       # Header, Sidebar, Footer
├── hooks/            # useWebSocket, useAudioStream, useSession, useLandmarks
├── lib/              # api.ts (REST client), ws.ts (WS client)
├── store/            # Zustand stores: session, transcript, auth
├── types/            # TypeScript type definitions
└── styles/           # Global styles
```

## Conventions

### File Naming
- Components: `PascalCase.tsx` (e.g., `VideoRoom.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAudioStream.ts`)
- Stores: `camelCase.ts` with `Store` suffix (e.g., `sessionStore.ts`)
- Types: `camelCase.ts` (e.g., `session.ts`)
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)

### Component Pattern
```tsx
"use client"; // Only if client-side interactivity needed

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ComponentNameProps {
  // Props definition
}

export function ComponentName({ ...props }: ComponentNameProps) {
  // Component logic
  return (
    <div className={cn("base-classes")}>
      {/* JSX */}
    </div>
  );
}
```

### Custom Hook Pattern
```tsx
import { useState, useEffect } from "react";

export function useHookName(params: ParamType) {
  const [state, setState] = useState<StateType>(initialValue);

  useEffect(() => {
    // Effect logic
    return () => { /* Cleanup */ };
  }, [params]);

  return { state, /* actions */ };
}
```

### Zustand Store Pattern
```tsx
import { create } from "zustand";

interface StoreState {
  // State shape
  data: DataType | null;
  isLoading: boolean;
  // Actions
  fetchData: () => Promise<void>;
  reset: () => void;
}

export const useStoreNameStore = create<StoreState>((set, get) => ({
  data: null,
  isLoading: false,
  fetchData: async () => {
    set({ isLoading: true });
    try {
      const data = await api.getData();
      set({ data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  reset: () => set({ data: null, isLoading: false }),
}));
```

### REST Client Pattern (lib/api.ts)
```tsx
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) throw new ApiError(res.status, await res.json());
  return res.json();
}
```

### WebSocket Event Handling
```tsx
// hooks/useWebSocket.ts — connects to core-backend event stream
// Events follow envelope: { type, sessionId, timestamp, payload }
// Dispatch to appropriate Zustand store based on event type
```

## Key Dependencies
```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "zustand": "^5.0.0",
  "tailwindcss": "^4.0.0",
  "@mediapipe/tasks-vision": "^0.10.0",
  "zod": "^3.23.0"
}
```

## Features from Competitive Research

### Practice Mode
- Add a "Practice" toggle on session creation — skips scoring, unlimited retries
- Route: `/interview/[sessionId]/room?mode=practice`
- No score UI shown in practice mode, only transcript

### Camera/Mic Test Page
- Route: `/interview/[sessionId]/consent` includes device test
- Use `navigator.mediaDevices.enumerateDevices()` to list devices
- Camera/mic preview using MediaStream API

### Timer/Progress Indicator
- Show elapsed time and estimated remaining in room view
- Progress bar showing questions completed / total planned

### Score Comparison Dashboard
- Route: `/(dashboard)/sessions` shows trend chart across sessions
- Use a lightweight charting lib (recharts or chart.js)
- Compare overall score, per-category scores over time

### Question Preview
- Before starting, show the question plan topics (not exact questions)
- Allow candidate to request different focus areas

## Error Handling
- Use React Error Boundaries for component-level errors
- Global error toast via shadcn/ui `Toaster`
- Network errors: auto-retry with exponential backoff (max 3 retries)
- WebSocket disconnect: show reconnecting indicator, auto-reconnect

## Testing
- Unit tests: Vitest + React Testing Library
- Component tests: test user interactions and state changes
- E2E: Playwright for critical flows (login → upload → interview → report)
