import { create } from "zustand";
import type { Session, SessionState } from "@/types/session";

interface SessionStoreState {
  currentSession: Session | null;
  sessions: Session[];
  isLoading: boolean;
  setCurrentSession: (session: Session | null) => void;
  updateState: (state: SessionState) => void;
  setSessions: (sessions: Session[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useSessionStore = create<SessionStoreState>((set) => ({
  currentSession: null,
  sessions: [],
  isLoading: false,
  setCurrentSession: (session) => set({ currentSession: session }),
  updateState: (state) =>
    set((prev) =>
      prev.currentSession
        ? { currentSession: { ...prev.currentSession, state } }
        : {},
    ),
  setSessions: (sessions) => set({ sessions }),
  setLoading: (isLoading) => set({ isLoading }),
}));
