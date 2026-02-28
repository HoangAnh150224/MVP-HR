import { create } from "zustand";
import type { TranscriptTurn, TranscriptPartial } from "@/types/events";

interface TranscriptState {
  turns: TranscriptTurn[];
  partial: TranscriptPartial | null;
  addTurn: (turn: TranscriptTurn) => void;
  setPartial: (partial: TranscriptPartial | null) => void;
  reset: () => void;
}

export const useTranscriptStore = create<TranscriptState>((set) => ({
  turns: [],
  partial: null,
  addTurn: (turn) => set((state) => ({ turns: [...state.turns, turn], partial: null })),
  setPartial: (partial) => set({ partial }),
  reset: () => set({ turns: [], partial: null }),
}));
