"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Session } from "@/types/session";

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [targetRole, setTargetRole] = useState("");
  const [difficulty, setDifficulty] = useState<"entry" | "mid" | "senior">("mid");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [progressMsg, setProgressMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSessions = useCallback(async () => {
    try {
      const data = await api.get("/api/v1/sessions");
      setSessions(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) return;
    setCreating(true);
    setProgressMsg("Đang tạo phiên...");
    setErrorMsg("");

    try {
      const session: Session = await api.post("/api/v1/sessions", {
        targetRole: targetRole.trim(),
        difficulty,
        mode: "scored",
      });

      if (cvFile) {
        setProgressMsg("Đang phân tích CV (có thể mất 30-60 giây)...");
        try {
          await api.upload("/api/v1/cv-profiles/upload", cvFile, {
            sessionId: session.id,
          });
          setProgressMsg("CV đã được phân tích xong!");
        } catch (uploadErr) {
          console.error("CV upload failed, continuing with default questions:", uploadErr);
          setErrorMsg("Phân tích CV thất bại. Sẽ dùng câu hỏi mặc định.");
        }
      }

      router.push(`/interview/${session.id}/consent`);
    } catch (err) {
      console.error("Failed to create session:", err);
      setProgressMsg("");
      setErrorMsg("Không thể tạo phiên phỏng vấn. Vui lòng thử lại.");
    } finally {
      setCreating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCvFile(file);
  };

  const clearFile = () => {
    setCvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const stateLabel: Record<string, string> = {
    CREATED: "Mới tạo",
    CV_UPLOADING: "Đang tải CV",
    CV_PARSED: "CV đã phân tích",
    CONSENT_PENDING: "Chờ đồng ý",
    JOINING: "Đang kết nối",
    LIVE: "Đang phỏng vấn",
    WRAP_UP: "Đang kết thúc",
    ENDED: "Đã kết thúc",
    SCORING: "Đang chấm điểm...",
    REPORT_READY: "Có báo cáo",
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Bắt đầu phỏng vấn mới</h2>
        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700">
                Vị trí ứng tuyển
              </label>
              <input
                id="targetRole"
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="mt-1 block w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="VD: Frontend Developer"
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                Độ khó
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "entry" | "mid" | "senior")}
                className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              CV của bạn (không bắt buộc)
            </label>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload CV để AI phỏng vấn dựa trên kinh nghiệm của bạn. Hỗ trợ PDF, DOCX, TXT (tối đa 5MB).
            </p>
            <div className="mt-1 flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleFileChange}
                className="block text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
              />
              {cvFile && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Xóa
                </button>
              )}
            </div>
            {cvFile && (
              <p className="mt-1 text-sm text-green-600">
                Đã chọn: {cvFile.name} ({(cvFile.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={creating}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? "Đang xử lý..." : "Bắt đầu phỏng vấn"}
            </button>
            {progressMsg && (
              <span className="text-sm text-blue-600">{progressMsg}</span>
            )}
            {errorMsg && (
              <span className="text-sm text-red-600">{errorMsg}</span>
            )}
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">Lịch sử phỏng vấn</h2>
        {loading ? (
          <p className="mt-4 text-sm text-gray-500">Đang tải...</p>
        ) : sessions.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            Chưa có phiên phỏng vấn nào. Hãy bắt đầu phiên đầu tiên!
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-md border bg-white p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{s.targetRole}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(s.createdAt).toLocaleDateString("vi-VN")} -{" "}
                    {stateLabel[s.state] || s.state}
                  </p>
                </div>
                {(s.state === "CREATED" || s.state === "CV_PARSED") && (
                  <button
                    onClick={() => router.push(`/interview/${s.id}/consent`)}
                    className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Vào phỏng vấn
                  </button>
                )}
                {(s.state === "CONSENT_PENDING" || s.state === "JOINING") && (
                  <button
                    onClick={() => router.push(`/interview/${s.id}`)}
                    className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Tiếp tục
                  </button>
                )}
                {s.state === "REPORT_READY" && (
                  <button
                    onClick={() => router.push(`/interview/${s.id}/report`)}
                    className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Xem báo cáo
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
