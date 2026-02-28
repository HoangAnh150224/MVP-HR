"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useAudioStream } from "@/hooks/useAudioStream";
import InterviewControls from "@/components/InterviewControls";

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { hydrate } = useAuthStore();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<object | null>(null);

  const audioStream = useAudioStream({
    sessionId,
    onTranscript: (speaker, text) => {
      console.log(`[${speaker}] ${text}`);
    },
    onStatusChange: (state) => {
      console.log("Voice agent status:", state);
    },
    onError: (message) => {
      console.error("Voice agent error:", message);
      setError(message);
    },
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Start interview: call core-backend to get session metadata, then connect WebSocket
  const startInterview = useCallback(async () => {
    try {
      const data = await api.post(`/api/v1/interview/start/${sessionId}`, {});
      setMetadata(data.metadata || {});
    } catch (err) {
      console.error("Failed to start interview:", err);
      setError("Không thể bắt đầu phỏng vấn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!useAuthStore.getState().isAuthenticated) {
        router.replace("/login");
        return;
      }
      startInterview();
    }, 100);
    return () => clearTimeout(timer);
  }, [startInterview, router]);

  // Connect to voice-agent once metadata is ready
  useEffect(() => {
    if (metadata && !audioStream.isConnected && audioStream.connectionState === "disconnected") {
      audioStream.connect(metadata);
    }
  }, [metadata, audioStream]);

  const handleEnd = useCallback(async () => {
    try {
      await api.post(`/api/v1/sessions/${sessionId}/end`, {});
    } catch {
      // ignore
    }
    audioStream.disconnect();
    router.push(`/interview/${sessionId}/report`);
  }, [sessionId, audioStream, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-white">Đang kết nối phòng phỏng vấn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-900">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-md bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
        >
          Quay lại Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      <InterviewControls
        sessionId={sessionId}
        isConnected={audioStream.isConnected}
        connectionState={audioStream.connectionState}
        onEnd={handleEnd}
        micEnabled={audioStream.micEnabled}
        onToggleMic={audioStream.toggleMic}
      />
    </div>
  );
}
