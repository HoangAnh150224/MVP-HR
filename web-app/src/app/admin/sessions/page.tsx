"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface SessionRow {
  id: string;
  userId: string;
  targetRole: string;
  state: string;
  difficulty: string;
  createdAt: string;
}

export default function AdminSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadSessions = async (p: number) => {
    setLoading(true);
    try {
      const data = await api.get(`/api/v1/admin/sessions?page=${p}&size=20`);
      setSessions(data.sessions);
      setTotalPages(data.totalPages);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions(0);
  }, []);

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tất cả phiên phỏng vấn</h1>

      {loading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border bg-white shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Vị trí</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Độ khó</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Ngày tạo</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.targetRole}</td>
                    <td className="px-4 py-3 text-gray-600">{stateLabel[s.state] || s.state}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{s.difficulty}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(s.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/admin/sessions/${s.id}`)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => loadSessions(page - 1)}
                disabled={page === 0}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Trang {page + 1}/{totalPages}
              </span>
              <button
                onClick={() => loadSessions(page + 1)}
                disabled={page >= totalPages - 1}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
