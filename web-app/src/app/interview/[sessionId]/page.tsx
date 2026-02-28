"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useAudioStream } from "@/hooks/useAudioStream";
import InterviewControls from "@/components/InterviewControls";
import TranscriptPanel from "@/components/interview/TranscriptPanel";
import InterviewTimer from "@/components/interview/InterviewTimer";
import QuestionProgress from "@/components/interview/QuestionProgress";
import VisionWarningToast from "@/components/interview/VisionWarningToast";

interface TranscriptEntry {
  speaker: "ai" | "user";
  text: string;
}

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { hydrate } = useAuthStore();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<object | null>(null);
  const [partialText, setPartialText] = useState("");
  const [partialSpeaker, setPartialSpeaker] = useState<"ai" | "user">("ai");
  const [visionWarning, setVisionWarning] = useState<{ type: string; message: string } | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const totalQuestions = useRef(6);
  const [showTranscript, setShowTranscript] = useState(true);

  const audioStream = useAudioStream({
    sessionId,
    onTranscript: (speaker, text, isFinal) => {
      if (isFinal) {
        setPartialText("");
        if (speaker === "ai") {
          // Rough heuristic: count AI messages ending in "?" as questions
          if (text.includes("?")) {
            setQuestionCount((prev) => prev + 1);
          }
        }
      } else {
        setPartialText(text);
        setPartialSpeaker(speaker);
      }
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
      const meta = data.metadata || {};
      console.log(
        "[InterviewPage] Metadata from backend:",
        JSON.stringify({
          hasQuestionPlan: !!meta.questionPlan,
          questionCount: meta.questionPlan?.questions?.length ?? 0,
        }),
      );
      if (meta.questionPlan?.questions?.length) {
        totalQuestions.current = meta.questionPlan.questions.length;
      }
      setMetadata(meta);
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
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
        <div className="flex items-center gap-3">
          <InterviewTimer isRunning={audioStream.isConnected} />
          <QuestionProgress
            current={Math.min(questionCount, totalQuestions.current)}
            total={totalQuestions.current}
          />
        </div>
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="rounded-md bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 lg:hidden"
        >
          {showTranscript ? "Ẩn transcript" : "Xem transcript"}
        </button>
      </div>

      {/* Main content: 2-column on desktop */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Video + Controls (60%) */}
        <div className="flex flex-1 flex-col lg:w-[60%]">
          <InterviewControls
            sessionId={sessionId}
            isConnected={audioStream.isConnected}
            connectionState={audioStream.connectionState}
            onEnd={handleEnd}
            micEnabled={audioStream.micEnabled}
            onToggleMic={audioStream.toggleMic}
          />
        </div>

        {/* Right: Transcript Panel (40%) */}
        <div
          className={`${
            showTranscript ? "flex" : "hidden"
          } w-full flex-col border-l border-gray-800 lg:flex lg:w-[40%]`}
        >
          <TranscriptPanel
            transcripts={audioStream.transcripts}
            partialText={partialText}
            partialSpeaker={partialSpeaker}
          />
        </div>
      </div>

      {/* Vision warning toast */}
      <VisionWarningToast warning={visionWarning} />
    </div>
  );
}
