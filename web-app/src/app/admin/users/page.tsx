"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUsers = async (p: number) => {
    setLoading(true);
    try {
      const data = await api.get(`/api/v1/admin/users?page=${p}&size=20`);
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(0);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý người dùng</h1>

      {loading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border bg-white shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Tên</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Vai trò</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Ngày tạo</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/admin/users/${u.id}`)}
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
                onClick={() => loadUsers(page - 1)}
                disabled={page === 0}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Trang {page + 1}/{totalPages}
              </span>
              <button
                onClick={() => loadUsers(page + 1)}
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
