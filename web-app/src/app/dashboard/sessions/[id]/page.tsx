"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Session } from "@/types/session";

interface TranscriptEntry {
  speaker: "ai" | "user";
  text: string;
  turnIndex: number;
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [session, setSession] = useState<Session | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "transcript" | "report">("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sessionData, transcriptData] = await Promise.all([
          api.get(`/api/v1/sessions/${id}`),
          api.get(`/api/v1/sessions/${id}/transcripts`).catch(() => []),
        ]);
        setSession(sessionData);
        setTranscripts(transcriptData);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return <p className="text-center text-gray-500">Không tìm thấy phiên phỏng vấn.</p>;
  }

  const stateLabel: Record<string, string> = {
    CREATED: "Mới tạo",
    CV_UPLOADING: "Đang tải CV",
    CV_PARSED: "CV đã phân tích",
    CONSENT_PENDING: "Chờ đồng ý",
    JOINING: "Đang kết nối",
    LIVE: "Đang phỏng vấn",
    WRAP_UP: "Đang kết thúc",
    ENDED: "Đã kết thúc",
    SCORING: "Đang chấm điểm",
    REPORT_READY: "Có báo cáo",
  };

  const tabs = [
    { key: "overview" as const, label: "Tổng quan" },
    { key: "transcript" as const, label: "Bản ghi" },
    { key: "report" as const, label: "Báo cáo" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.push("/dashboard")} className="text-sm text-blue-600 hover:text-blue-800">
            &larr; Quay lại Dashboard
          </button>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{session.targetRole}</h1>
          <p className="text-sm text-gray-500">
            {new Date(session.createdAt).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" - "}
            {stateLabel[session.state] || session.state}
          </p>
        </div>
        {session.state === "REPORT_READY" && (
          <button
            onClick={() => router.push(`/interview/${id}/report`)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Xem báo cáo đầy đủ
          </button>
        )}
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

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Vị trí</p>
            <p className="mt-1 font-medium text-gray-900">{session.targetRole}</p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Độ khó</p>
            <p className="mt-1 font-medium text-gray-900 capitalize">{session.difficulty}</p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Trạng thái</p>
            <p className="mt-1 font-medium text-gray-900">{stateLabel[session.state]}</p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Tổng lượt hội thoại</p>
            <p className="mt-1 font-medium text-gray-900">{transcripts.length}</p>
          </div>
        </div>
      )}

      {activeTab === "transcript" && (
        <div className="rounded-lg bg-white p-6 shadow">
          {transcripts.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có bản ghi cho phiên này.</p>
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
                      {t.speaker === "ai" ? "AI Interviewer" : "Bạn"}
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
        <div className="rounded-lg bg-white p-6 shadow text-center">
          {session.state === "REPORT_READY" ? (
            <div>
              <p className="text-gray-600 mb-4">Báo cáo đã sẵn sàng!</p>
              <button
                onClick={() => router.push(`/interview/${id}/report`)}
                className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Xem báo cáo đầy đủ
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Báo cáo chưa sẵn sàng. Trạng thái hiện tại: {stateLabel[session.state]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
