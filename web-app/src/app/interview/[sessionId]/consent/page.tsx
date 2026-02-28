"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ConsentPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [camera, setCamera] = useState(false);
  const [microphone, setMicrophone] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const allChecked = camera && microphone && aiAnalysis;

  const handleSubmit = async () => {
    if (!allChecked) return;
    setSubmitting(true);
    setError("");

    try {
      await api.post(`/api/v1/sessions/${sessionId}/consent`, {});
      router.push(`/interview/${sessionId}`);
    } catch {
      setError("Không thể xác nhận. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">Đồng ý trước khi bắt đầu</h1>
        <p className="mt-2 text-sm text-gray-600">
          Phiên phỏng vấn sử dụng AI để phân tích và đánh giá. Vui lòng đọc kỹ và đồng ý
          với các điều khoản dưới đây trước khi tiếp tục.
        </p>

        <div className="mt-6 space-y-4">
          <label className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={camera}
              onChange={(e) => setCamera(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-900">Camera</p>
              <p className="text-sm text-gray-500">
                Cho phép sử dụng camera để phân tích ngôn ngữ cơ thể (giao tiếp bằng mắt,
                tư thế, biểu cảm). Video không được lưu trữ.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={microphone}
              onChange={(e) => setMicrophone(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-900">Microphone</p>
              <p className="text-sm text-gray-500">
                Cho phép sử dụng microphone để trò chuyện với AI interviewer. Âm thanh được
                xử lý real-time và không được lưu trữ.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={aiAnalysis}
              onChange={(e) => setAiAnalysis(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-900">Phân tích bởi AI</p>
              <p className="text-sm text-gray-500">
                Đồng ý cho AI phân tích nội dung câu trả lời, chấm điểm và tạo báo cáo cải thiện.
                Dữ liệu chỉ dùng cho mục đích đánh giá.
              </p>
            </div>
          </label>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!allChecked || submitting}
            className="flex-1 rounded-md bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Đang xử lý..." : "Bắt đầu phỏng vấn"}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-md bg-gray-200 px-6 py-3 font-medium text-gray-700 hover:bg-gray-300"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
