"use client";

interface QuestionProgressProps {
  current: number;
  total: number;
}

export default function QuestionProgress({ current, total }: QuestionProgressProps) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-gray-800/60 px-4 py-1.5">
      <span className="text-sm text-gray-300">
        Câu hỏi <span className="font-bold text-white">{current}</span>/{total}
      </span>
    </div>
  );
}
