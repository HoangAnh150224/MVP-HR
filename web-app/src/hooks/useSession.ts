import { useEffect } from "react";
import { api } from "@/lib/api";
import { useSessionStore } from "@/store/sessionStore";
import type { Session } from "@/types/session";

export function useSession(sessionId: string | null) {
  const { currentSession, isLoading, setCurrentSession, setLoading, updateState } =
    useSessionStore();

  useEffect(() => {
    if (!sessionId) return;

    setLoading(true);
    api
      .get(`/api/v1/sessions/${sessionId}`)
      .then((data: Session) => setCurrentSession(data))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return { session: currentSession, isLoading, updateState };
}
