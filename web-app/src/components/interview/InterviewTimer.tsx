"use client";

import { useState, useEffect, useRef } from "react";

interface InterviewTimerProps {
  isRunning: boolean;
}

export default function InterviewTimer({ isRunning }: InterviewTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    if (!startRef.current) startRef.current = Date.now();

    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current!) / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-2 rounded-full bg-gray-800/60 px-4 py-1.5">
      <div className={`h-2 w-2 rounded-full ${isRunning ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
      <span className="font-mono text-sm text-gray-200">
        {mm}:{ss}
      </span>
    </div>
  );
}
