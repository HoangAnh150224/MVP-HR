"use client";

import { useState, useCallback } from "react";
import SelfVideo from "@/components/SelfVideo";

interface InterviewControlsProps {
  sessionId: string;
  isConnected: boolean;
  connectionState: "disconnected" | "connecting" | "connected";
  onEnd: () => void;
  micEnabled: boolean;
  onToggleMic: () => void;
}

export default function InterviewControls({
  sessionId,
  isConnected,
  connectionState,
  onEnd,
  micEnabled,
  onToggleMic,
}: InterviewControlsProps) {
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [ending, setEnding] = useState(false);

  const toggleCamera = useCallback(() => {
    setCameraEnabled((prev) => !prev);
  }, []);

  const handleEnd = useCallback(async () => {
    setEnding(true);
    onEnd();
  }, [onEnd]);

  const statusText: Record<string, string> = {
    connecting: "Đang kết nối...",
    connected: "Đã kết nối - Đang phỏng vấn",
    disconnected: "Đã ngắt kết nối",
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      {/* Status */}
      <div className="text-center">
        <div
          className={`mb-2 inline-block h-3 w-3 rounded-full ${
            isConnected ? "bg-green-500" : "bg-yellow-500"
          }`}
        />
        <p className="text-lg text-white">
          {statusText[connectionState] || connectionState}
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Phiên: {sessionId.slice(0, 8)}...
        </p>
      </div>

      {/* Self video with face detection */}
      <SelfVideo sessionId={sessionId} enabled={cameraEnabled && isConnected} />

      {/* Hint */}
      {isConnected && (
        <p className="max-w-md text-center text-sm text-gray-400">
          AI Interviewer sẽ tự động hỏi bạn. Hãy trả lời bằng tiếng Việt.
          Khi muốn kết thúc, nhấn nút &quot;Kết thúc phỏng vấn&quot;.
        </p>
      )}

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={onToggleMic}
          disabled={!isConnected}
          className={`rounded-full px-6 py-3 text-sm font-medium ${
            micEnabled
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-red-600 text-white hover:bg-red-500"
          } disabled:opacity-50`}
        >
          {micEnabled ? "Tắt mic" : "Bật mic"}
        </button>

        <button
          onClick={toggleCamera}
          disabled={!isConnected}
          className={`rounded-full px-6 py-3 text-sm font-medium ${
            cameraEnabled
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-red-600 text-white hover:bg-red-500"
          } disabled:opacity-50`}
        >
          {cameraEnabled ? "Tắt camera" : "Bật camera"}
        </button>

        <button
          onClick={handleEnd}
          disabled={ending || !isConnected}
          className="rounded-full bg-red-600 px-6 py-3 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
        >
          {ending ? "Đang kết thúc..." : "Kết thúc phỏng vấn"}
        </button>
      </div>
    </div>
  );
}
