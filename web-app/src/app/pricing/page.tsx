"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import PricingCard from "@/components/subscription/PricingCard";

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();
  const [currentTier, setCurrentTier] = useState("FREE");
  const [upgrading, setUpgrading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    async function loadSub() {
      try {
        const data = await api.get("/api/v1/subscriptions/me");
        setCurrentTier(data.tier);
      } catch {
        // ignore
      }
    }
    if (hydrated && isAuthenticated) loadSub();
  }, [hydrated, isAuthenticated]);

  const handleUpgrade = async (tier: string) => {
    if (!isAuthenticated) {
      router.push("/register");
      return;
    }
    setUpgrading(true);
    try {
      await api.post("/api/v1/subscriptions/upgrade", { tier });
      setCurrentTier(tier);
    } catch (err: any) {
      alert(err.message || "Nâng cấp thất bại");
    } finally {
      setUpgrading(false);
    }
  };

  const plans = [
    {
      name: "Miễn phí",
      tier: "FREE",
      price: "0đ",
      period: "mãi mãi",
      features: [
        "2 phiên phỏng vấn/tuần",
        "Báo cáo cơ bản",
        "Phân tích STAR",
        "Nhận xét từ AI",
      ],
    },
    {
      name: "Gói 3 ngày",
      tier: "TRIAL_3D",
      price: "49.000đ",
      period: "3 ngày",
      highlighted: true,
      features: [
        "Phỏng vấn không giới hạn",
        "Báo cáo chi tiết",
        "Câu trả lời mẫu",
        "Phân tích giọng nói",
        "Phân tích ngôn ngữ cơ thể",
      ],
    },
    {
      name: "Gói tháng",
      tier: "MONTHLY",
      price: "99.000đ",
      period: "tháng",
      features: [
        "Tất cả tính năng gói 3 ngày",
        "Theo dõi tiến bộ dài hạn",
        "Hỗ trợ ưu tiên",
        "Không giới hạn phiên",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Chọn gói phù hợp với bạn</h1>
          <p className="mt-3 text-gray-600">
            Nâng cấp để phỏng vấn không giới hạn và nhận phản hồi chi tiết hơn
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard
              key={plan.tier}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              highlighted={plan.highlighted}
              currentTier={currentTier === plan.tier}
              onSelect={() => handleUpgrade(plan.tier)}
              disabled={upgrading}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push(isAuthenticated ? "/dashboard" : "/")}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            &larr; Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
