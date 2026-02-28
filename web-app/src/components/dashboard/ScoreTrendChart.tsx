"use client";

interface ScoreTrendChartProps {
  scores: number[];
}

export default function ScoreTrendChart({ scores }: ScoreTrendChartProps) {
  if (scores.length < 2) return null;

  const max = Math.max(...scores, 100);
  const min = Math.min(...scores, 0);
  const range = max - min || 1;
  const width = 400;
  const height = 120;
  const padding = 20;

  const points = scores.map((score, i) => {
    const x = padding + (i / (scores.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((score - min) / range) * (height - 2 * padding);
    return { x, y, score };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Xu hướng điểm số</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: 150 }}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = height - padding - ((v - min) / range) * (height - 2 * padding);
          return (
            <g key={v}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeWidth={0.5} />
              <text x={2} y={y + 3} fontSize={8} fill="#9ca3af">{v}</text>
            </g>
          );
        })}

        {/* Line */}
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3} fill="#3b82f6" />
            <text x={p.x} y={p.y - 8} fontSize={8} textAnchor="middle" fill="#374151">
              {p.score}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
