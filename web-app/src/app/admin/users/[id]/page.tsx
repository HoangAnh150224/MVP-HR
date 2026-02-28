"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface UserDetail {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  totalSessions: number;
  sessions: { id: string; targetRole: string; state: string; createdAt: string; score?: number }[];
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleUpdating, setRoleUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get(`/api/v1/admin/users/${id}`);
        setUser(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleRoleChange = async (newRole: string) => {
    setRoleUpdating(true);
    try {
      await api.patch(`/api/v1/admin/users/${id}/role`, { role: newRole });
      setUser((prev) => prev ? { ...prev, role: newRole } : prev);
    } catch {
      // ignore
    } finally {
      setRoleUpdating(false);
    }
  };

  if (loading) return <p className="text-gray-500">Đang tải...</p>;
  if (!user) return <p className="text-red-500">Không tìm thấy người dùng.</p>;

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/admin/users")} className="text-sm text-blue-600 hover:text-blue-800">
        &larr; Quay lại danh sách
      </button>

      <div className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Ngày tạo</p>
            <p className="font-medium">{new Date(user.createdAt).toLocaleDateString("vi-VN")}</p>
          </div>
          <div>
            <p className="text-gray-500">Tổng phiên</p>
            <p className="font-medium">{user.totalSessions}</p>
          </div>
          <div>
            <p className="text-gray-500">Vai trò</p>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={roleUpdating}
                className="rounded-md border px-2 py-1 text-sm"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              {roleUpdating && <span className="text-xs text-gray-500">Đang cập nhật...</span>}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Phiên phỏng vấn</h2>
        {user.sessions.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có phiên nào.</p>
        ) : (
          <div className="space-y-2">
            {user.sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border bg-white p-4">
                <div>
                  <p className="font-medium text-gray-900">{s.targetRole}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(s.createdAt).toLocaleDateString("vi-VN")} - {s.state}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {s.score !== undefined && (
                    <span className="rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-700">
                      {s.score}/100
                    </span>
                  )}
                  <button
                    onClick={() => router.push(`/admin/sessions/${s.id}`)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
