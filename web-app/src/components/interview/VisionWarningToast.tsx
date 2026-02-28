"use client";

import { useEffect, useState } from "react";

interface VisionWarning {
  type: string;
  message: string;
}

interface VisionWarningToastProps {
  warning: VisionWarning | null;
}

export default function VisionWarningToast({ warning }: VisionWarningToastProps) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<VisionWarning | null>(null);

  useEffect(() => {
    if (warning) {
      setCurrent(warning);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [warning]);

  if (!visible || !current) return null;

  const icon = current.type.toLowerCase().includes("eye")
    ? "👁"
    : current.type.toLowerCase().includes("posture")
      ? "🧍"
      : "⚠";

  return (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 animate-fade-in">
      <div className="rounded-lg bg-amber-500/90 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur">
        <span className="mr-2">{icon}</span>
        {current.message}
      </div>
    </div>
  );
}
