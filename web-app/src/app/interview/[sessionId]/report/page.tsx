"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type {
  Report,
  ScoreCategory,
  TurnScore,
  ActionableImprovement,
  SpeechMetricsSummary,
  VisionMetricsSummary,
} from "@/types/report";

function getScoreColor(score: number, max = 100): string {
  const pct = (score / max) * 100;
  if (pct >= 80) return "text-green-600";
  if (pct >= 60) return "text-yellow-600";
  return "text-red-600";
}

function getBarColor(score: number, max = 100): string {
  const pct = (score / max) * 100;
  if (pct >= 80) return "bg-green-500";
  if (pct >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

function ScoreOverview({ score }: { score: number }) {
  const label =
    score >= 80 ? "Xuất sắc" : score >= 60 ? "Khá" : score >= 40 ? "Trung bình" : "Cần cải thiện";
  return (
    <div className="flex flex-col items-center rounded-xl bg-white p-8 shadow">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Điểm tổng</p>
      <p className={`mt-2 text-6xl font-bold ${getScoreColor(score)}`}>{score}</p>
      <p className="mt-1 text-lg text-gray-600">{label}</p>
    </div>
  );
}

function CategoryScores({ categories }: { categories: ScoreCategory[] }) {
  if (!categories || categories.length === 0) return null;
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Điểm theo danh mục</h3>
      <div className="space-y-4">
        {categories.map((cat, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{cat.name}</span>
              <span className={`font-bold ${getScoreColor(cat.score, cat.maxScore)}`}>
                {cat.score}/{cat.maxScore}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-200">
              <div
                className={`h-2.5 rounded-full ${getBarColor(cat.score, cat.maxScore)}`}
                style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">{cat.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpeechMetricsSection({ metrics }: { metrics: SpeechMetricsSummary }) {
  const wpmLabel =
    metrics.avgWpm >= 140 && metrics.avgWpm <= 170
      ? "Tốt"
      : metrics.avgWpm < 140
        ? "Hơi chậm"
        : "Hơi nhanh";
  const wpmColor =
    metrics.avgWpm >= 140 && metrics.avgWpm <= 170
      ? "text-green-600"
      : "text-yellow-600";

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Chỉ số giọng nói</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{metrics.avgWpm}</p>
          <p className="text-xs text-gray-500">Từ/phút</p>
          <p className={`text-xs font-medium ${wpmColor}`}>{wpmLabel}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{metrics.totalFillers}</p>
          <p className="text-xs text-gray-500">Từ đệm</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {Math.floor(metrics.totalUtteranceSeconds / 60)}:{String(Math.round(metrics.totalUtteranceSeconds % 60)).padStart(2, "0")}
          </p>
          <p className="text-xs text-gray-500">Thời gian nói</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs text-gray-500 mb-1">Top từ đệm</p>
          {Object.entries(metrics.topFillers || {}).slice(0, 3).map(([word, count]) => (
            <p key={word} className="text-sm text-gray-700">
              &ldquo;{word}&rdquo;: {count}x
            </p>
          ))}
          {Object.keys(metrics.topFillers || {}).length === 0 && (
            <p className="text-sm text-green-600">Không có</p>
          )}
        </div>
      </div>
    </div>
  );
}

function VisionMetricsSection({ metrics }: { metrics: VisionMetricsSummary }) {
  const eyeColor = metrics.eyeContactPercent >= 70 ? "text-green-600" : metrics.eyeContactPercent >= 50 ? "text-yellow-600" : "text-red-600";
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ngôn ngữ cơ thể</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <p className={`text-2xl font-bold ${eyeColor}`}>{metrics.eyeContactPercent}%</p>
          <p className="text-xs text-gray-500">Giao tiếp mắt</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{metrics.postureWarnings}</p>
          <p className="text-xs text-gray-500">Cảnh báo tư thế</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{(metrics.avgSentiment * 100).toFixed(0)}%</p>
          <p className="text-xs text-gray-500">Biểu cảm tích cực</p>
        </div>
      </div>
    </div>
  );
}

function TurnScoreCard({ turn, index }: { turn: TurnScore; index: number }) {
  const [showSample, setShowSample] = useState(false);
  const starLabels = ["S", "T", "A", "R"];
  const starKeys = ["situation", "task", "action", "result"] as const;

  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">Câu {index + 1}</p>
          <p className="mt-1 font-medium text-gray-900">{turn.question}</p>
        </div>
        <span className={`ml-4 text-2xl font-bold ${getScoreColor(turn.score, 10)}`}>
          {turn.score}/10
        </span>
      </div>
      <p className="mt-3 text-sm text-gray-600">{turn.feedback}</p>

      {/* STAR Components */}
      <div className="mt-3 flex gap-2">
        {starKeys.map((key, i) => (
          <span
            key={key}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              turn.starComponents[key]
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-500"
            }`}
          >
            {starLabels[i]}
          </span>
        ))}
      </div>

      {/* STAR Analysis */}
      {turn.starAnalysis && turn.starAnalysis.missing.length > 0 && (
        <div className="mt-3 rounded-md bg-amber-50 p-3">
          <p className="text-xs font-medium text-amber-800">
            Thiếu: {turn.starAnalysis.missing.join(", ")}
          </p>
          <p className="mt-1 text-xs text-amber-700">{turn.starAnalysis.suggestion}</p>
        </div>
      )}

      {/* Sample Answer Toggle */}
      {turn.sampleAnswer && (
        <div className="mt-3">
          <button
            onClick={() => setShowSample(!showSample)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {showSample ? "Ẩn câu trả lời mẫu" : "Xem câu trả lời mẫu"}
          </button>
          {showSample && (
            <div className="mt-2 rounded-md bg-blue-50 p-3">
              <p className="text-sm text-blue-900 whitespace-pre-line">{turn.sampleAnswer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActionChecklist({ improvements }: { improvements: ActionableImprovement[] }) {
  if (!improvements || improvements.length === 0) return null;
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Gợi ý cải thiện</h3>
      <div className="space-y-4">
        {improvements.map((item, i) => (
          <div key={i} className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
            <p className="font-medium text-gray-900">{item.area}</p>
            <p className="mt-1 text-sm text-gray-600">
              <span className="font-medium">Hiện tại:</span> {item.currentLevel}
            </p>
            <p className="mt-1 text-sm text-gray-700">{item.suggestion}</p>
            {item.example && (
              <p className="mt-2 text-sm italic text-gray-500">Ví dụ: {item.example}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReport() {
      try {
        const data = await api.get(`/api/v1/reports/session/${sessionId}`);
        const reportData = typeof data.reportData === "string"
          ? JSON.parse(data.reportData)
          : data.reportData;

        setReport({
          sessionId: data.sessionId,
          overallScore: data.overallScore ?? reportData.overallScore ?? 0,
          categories: reportData.categories ?? [],
          turnScores: reportData.turnScores ?? [],
          strengths: reportData.strengths ?? [],
          improvements: reportData.improvements ?? [],
          speechMetrics: reportData.speechMetrics ?? undefined,
          visionMetrics: reportData.visionMetrics ?? undefined,
          speechFeedback: reportData.speechFeedback ?? undefined,
          visionFeedback: reportData.visionFeedback ?? undefined,
          generatedAt: data.createdAt,
        });
      } catch {
        setError("Chưa có báo cáo cho phiên này. Báo cáo đang được tạo...");
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-gray-600">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Tải lại
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
          >
            Về Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo phỏng vấn</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            &larr; Về Dashboard
          </button>
        </div>

        <div className="space-y-6">
          <ScoreOverview score={report.overallScore} />

          <CategoryScores categories={report.categories} />

          {/* Speech Metrics */}
          {report.speechMetrics && report.speechMetrics.avgWpm > 0 && (
            <SpeechMetricsSection metrics={report.speechMetrics} />
          )}

          {/* Vision Metrics */}
          {report.visionMetrics && report.visionMetrics.totalFrames > 0 && (
            <VisionMetricsSection metrics={report.visionMetrics} />
          )}

          {/* Speech/Vision Feedback */}
          {(report.speechFeedback || report.visionFeedback) && (
            <div className="rounded-xl bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Nhận xét giao tiếp</h3>
              {report.speechFeedback && (
                <p className="text-sm text-gray-700 mb-2">{report.speechFeedback}</p>
              )}
              {report.visionFeedback && (
                <p className="text-sm text-gray-700">{report.visionFeedback}</p>
              )}
            </div>
          )}

          {report.strengths.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Điểm mạnh</h3>
              <ul className="space-y-2">
                {report.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 text-green-500">&#10003;</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ActionChecklist improvements={report.improvements} />

          {report.turnScores.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết từng câu hỏi</h3>
              <div className="space-y-3">
                {report.turnScores.map((turn, i) => (
                  <TurnScoreCard key={i} turn={turn} index={i} />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center pt-4 pb-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-md bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700"
            >
              Phỏng vấn lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
