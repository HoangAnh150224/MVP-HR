"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface PlatformStats {
  totalUsers: number;
  totalSessions: number;
  averageScore: number;
  activeUsers: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get("/api/v1/admin/stats");
        setStats(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Đang tải...</p>;
  }

  if (!stats) {
    return <p className="text-red-500">Không thể tải dữ liệu thống kê.</p>;
  }

  const cards = [
    { label: "Tổng người dùng", value: stats.totalUsers },
    { label: "Tổng phiên phỏng vấn", value: stats.totalSessions },
    { label: "Điểm trung bình", value: stats.averageScore },
    { label: "Người dùng active (7 ngày)", value: stats.activeUsers },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tổng quan nền tảng</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card, i) => (
          <div key={i} className="rounded-xl bg-white p-6 shadow">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
