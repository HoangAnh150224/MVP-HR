"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface TranscriptEntry {
  speaker: string;
  text: string;
  turnIndex: number;
}

interface SessionDetail {
  session: {
    id: string;
    userId: string;
    targetRole: string;
    state: string;
    difficulty: string;
    createdAt: string;
  };
  transcripts: TranscriptEntry[];
  report?: {
    overallScore: number;
    reportData: string;
    createdAt: string;
  };
}

export default function AdminSessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "transcript" | "report">("overview");

  useEffect(() => {
    async function load() {
      try {
        const result = await api.get(`/api/v1/admin/sessions/${id}`);
        setData(result);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p className="text-gray-500">Đang tải...</p>;
  if (!data) return <p className="text-red-500">Không tìm thấy phiên.</p>;

  const { session, transcripts, report } = data;

  const tabs = [
    { key: "overview" as const, label: "Tổng quan" },
    { key: "transcript" as const, label: `Bản ghi (${transcripts.length})` },
    { key: "report" as const, label: "Báo cáo" },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/admin/sessions")} className="text-sm text-blue-600 hover:text-blue-800">
        &larr; Quay lại danh sách
      </button>

      <div>
        <h1 className="text-xl font-bold text-gray-900">{session.targetRole}</h1>
        <p className="text-sm text-gray-500">
          {new Date(session.createdAt).toLocaleDateString("vi-VN")} - {session.state} - {session.difficulty}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 pb-2 text-sm font-medium ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Trạng thái</p>
            <p className="mt-1 font-medium text-gray-900">{session.state}</p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Tổng lượt hội thoại</p>
            <p className="mt-1 font-medium text-gray-900">{transcripts.length}</p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Điểm</p>
            <p className="mt-1 font-medium text-gray-900">{report?.overallScore ?? "N/A"}</p>
          </div>
        </div>
      )}

      {activeTab === "transcript" && (
        <div className="rounded-lg bg-white p-6 shadow">
          {transcripts.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có bản ghi.</p>
          ) : (
            <div className="space-y-3">
              {transcripts.map((t, i) => (
                <div
                  key={i}
                  className={`flex ${t.speaker === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      t.speaker === "user"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-xs font-medium opacity-60">
                      {t.speaker === "ai" ? "AI Interviewer" : "User"}
                    </p>
                    <p className="text-sm">{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "report" && (
        <div className="rounded-lg bg-white p-6 shadow">
          {report ? (
            <div>
              <p className="text-lg font-bold text-gray-900">Điểm: {report.overallScore}/100</p>
              <p className="mt-1 text-sm text-gray-500">
                Tạo lúc: {new Date(report.createdAt).toLocaleString("vi-VN")}
              </p>
              <pre className="mt-4 max-h-96 overflow-auto rounded-md bg-gray-50 p-4 text-xs text-gray-700">
                {JSON.stringify(
                  typeof report.reportData === "string"
                    ? JSON.parse(report.reportData)
                    : report.reportData,
                  null,
                  2,
                )}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có báo cáo.</p>
          )}
        </div>
      )}
    </div>
  );
}
