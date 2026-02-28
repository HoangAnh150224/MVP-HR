"use client";

interface StatCardsProps {
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  trend: "up" | "down" | "same";
}

export default function StatCards({
  totalSessions,
  averageScore,
  bestScore,
  trend,
}: StatCardsProps) {
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500";

  const cards = [
    { label: "Tổng phiên", value: totalSessions, sub: "phỏng vấn" },
    { label: "Điểm trung bình", value: averageScore, sub: "/100" },
    { label: "Điểm cao nhất", value: bestScore, sub: "/100" },
    {
      label: "Xu hướng",
      value: trendIcon,
      sub: trend === "up" ? "Đang tiến bộ" : trend === "down" ? "Cần cố gắng" : "Ổn định",
      isIcon: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card, i) => (
        <div key={i} className="rounded-xl bg-white p-5 shadow">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
          <p className={`mt-2 text-3xl font-bold ${card.isIcon ? trendColor : "text-gray-900"}`}>
            {card.value}
          </p>
          <p className="mt-0.5 text-sm text-gray-500">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
