"use client";

import { useEffect, useRef } from "react";

interface TranscriptEntry {
  speaker: "ai" | "user";
  text: string;
}

interface TranscriptPanelProps {
  transcripts: TranscriptEntry[];
  partialText?: string;
  partialSpeaker?: "ai" | "user";
}

export default function TranscriptPanel({
  transcripts,
  partialText,
  partialSpeaker,
}: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts, partialText]);

  return (
    <div className="flex h-full flex-col rounded-lg bg-gray-800/50 backdrop-blur">
      <div className="border-b border-gray-700 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-300">Bản ghi cuộc phỏng vấn</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {transcripts.length === 0 && !partialText && (
          <p className="text-sm text-gray-500 italic">
            Cuộc phỏng vấn sẽ bắt đầu khi AI Interviewer chào bạn...
          </p>
        )}
        {transcripts.map((entry, i) => (
          <div
            key={i}
            className={`flex ${entry.speaker === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                entry.speaker === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-200"
              }`}
            >
              <p className="text-xs font-medium opacity-70 mb-0.5">
                {entry.speaker === "ai" ? "AI Interviewer" : "Bạn"}
              </p>
              <p>{entry.text}</p>
            </div>
          </div>
        ))}

        {/* Partial (streaming) text */}
        {partialText && partialSpeaker && (
          <div
            className={`flex ${partialSpeaker === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm opacity-60 ${
                partialSpeaker === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-200"
              }`}
            >
              <p className="text-xs font-medium opacity-70 mb-0.5">
                {partialSpeaker === "ai" ? "AI Interviewer" : "Bạn"}
              </p>
              <p>{partialText}...</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
