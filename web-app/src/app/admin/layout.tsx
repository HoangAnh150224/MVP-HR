"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, hydrate } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (hydrated) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user?.role !== "ADMIN") {
        router.replace("/dashboard");
      }
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated || !isAuthenticated || user?.role !== "ADMIN") return null;

  const sideLinks = [
    { href: "/admin", label: "Tổng quan" },
    { href: "/admin/users", label: "Người dùng" },
    { href: "/admin/sessions", label: "Phiên phỏng vấn" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-lg font-bold text-gray-900">
              InterviewPro Admin
            </Link>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800">
              &larr; Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              onClick={() => { logout(); router.replace("/login"); }}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside className="w-48 border-r bg-white min-h-[calc(100vh-57px)]">
          <nav className="p-4 space-y-1">
            {sideLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-md px-3 py-2 text-sm ${
                  pathname === link.href
                    ? "bg-blue-50 font-medium text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
