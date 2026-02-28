"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, setAuth, hydrate } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get("/api/v1/users/me");
        setProfile(data);
        setName(data.name);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    if (hydrated && isAuthenticated) load();
  }, [hydrated, isAuthenticated]);

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const data = await api.patch("/api/v1/users/me", { name: name.trim() });
      setProfile((prev) => prev ? { ...prev, name: data.name } : prev);
      // Update auth store
      if (user) {
        const token = localStorage.getItem("token") || "";
        setAuth(token, { ...user, name: data.name });
      }
      setMessage("Đã cập nhật tên thành công!");
    } catch (err: any) {
      setError(err.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setChangingPw(true);
    setMessage("");
    setError("");
    try {
      await api.post("/api/v1/users/me/change-password", { currentPassword, newPassword });
      setMessage("Đã đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "Đổi mật khẩu thất bại");
    } finally {
      setChangingPw(false);
    }
  };

  if (!hydrated || !isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  const tierLabel = "Free";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <button onClick={() => router.push("/dashboard")} className="text-lg font-bold text-gray-900">
              InterviewPro
            </button>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            &larr; Về Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>

        {message && (
          <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">{message}</div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
        )}

        {/* Account Info */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{profile?.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Vai trò</p>
              <p className="font-medium text-gray-900">{profile?.role === "ADMIN" ? "Admin" : "Người dùng"}</p>
            </div>
            <div>
              <p className="text-gray-500">Gói dịch vụ</p>
              <p className="font-medium text-gray-900">{tierLabel}</p>
            </div>
            <div>
              <p className="text-gray-500">Thành viên từ</p>
              <p className="font-medium text-gray-900">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("vi-VN") : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Name */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chỉnh sửa tên</h2>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSaveName}
              disabled={saving || name.trim() === profile?.name}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Đổi mật khẩu</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Mật khẩu hiện tại
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Mật khẩu mới (tối thiểu 6 ký tự)
              </label>
              <input
                id="newPassword"
                type="password"
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={changingPw}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {changingPw ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
