"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;
  if (isAuthenticated) return <div className="flex min-h-screen items-center justify-center"><p>Redirecting...</p></div>;

  const features = [
    {
      title: "AI Interviewer thông minh",
      desc: "Phỏng vấn 1:1 với AI, vặn hỏi sâu dựa trên CV của bạn. Cảm giác như phỏng vấn thật.",
    },
    {
      title: "Chấm điểm chi tiết",
      desc: "Điểm tổng, điểm từng câu, phân tích STAR, và câu trả lời mẫu để bạn học hỏi.",
    },
    {
      title: "Phân tích giọng nói",
      desc: "Đo tốc độ nói (WPM), đếm từ đệm, giúp bạn tự tin và chuyên nghiệp hơn.",
    },
    {
      title: "Phân tích ngôn ngữ cơ thể",
      desc: "Theo dõi giao tiếp mắt, tư thế ngồi qua camera. Nhận feedback real-time.",
    },
    {
      title: "Theo dõi tiến bộ",
      desc: "Dashboard hiển thị xu hướng điểm số, giúp bạn thấy rõ sự tiến bộ qua từng phiên.",
    },
    {
      title: "Hỗ trợ đa vị trí",
      desc: "Frontend, Backend, PM, BA, Marketing... AI tùy chỉnh câu hỏi theo từng vị trí.",
    },
  ];

  const plans = [
    { name: "Miễn phí", price: "0đ", period: "mãi mãi", desc: "2 phiên/tuần, báo cáo cơ bản" },
    { name: "Gói 3 ngày", price: "49.000đ", period: "3 ngày", desc: "Không giới hạn, đầy đủ tính năng", popular: true },
    { name: "Gói tháng", price: "99.000đ", period: "tháng", desc: "Tiết kiệm nhất, hỗ trợ ưu tiên" },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-5xl px-4 py-24 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Luyện phỏng vấn 1:1 với AI
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            InterviewPro giúp sinh viên luyện tập phỏng vấn với AI Interviewer thông minh,
            nhận phản hồi chi tiết và cải thiện kỹ năng phỏng vấn mỗi ngày.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Bắt đầu miễn phí
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Đăng nhập
            </Link>
          </div>
          <p className="mt-3 text-xs text-gray-500">Không cần thẻ tín dụng. 2 phiên miễn phí mỗi tuần.</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">Tính năng nổi bật</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
            Mọi thứ bạn cần để sẵn sàng cho buổi phỏng vấn tiếp theo
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div key={i} className="rounded-xl border p-6">
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">Bảng giá</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
            Giá cả phải chăng, phù hợp với sinh viên Việt Nam
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-xl p-6 ${
                  plan.popular
                    ? "border-2 border-blue-500 bg-white shadow-lg"
                    : "border bg-white"
                }`}
              >
                {plan.popular && (
                  <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700">
                    Phổ biến nhất
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500">/{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{plan.desc}</p>
                <Link
                  href="/register"
                  className={`mt-4 block rounded-md px-4 py-2 text-center text-sm font-medium ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Bắt đầu ngay
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sinh viên tin tưởng InterviewPro</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">123+</p>
              <p className="text-sm text-gray-600">Sinh viên tham gia khảo sát</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">69%</p>
              <p className="text-sm text-gray-600">Lo lắng khi phỏng vấn</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">62.6%</p>
              <p className="text-sm text-gray-600">Muốn AI vặn hỏi sâu</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white">
            Sẵn sàng cho buổi phỏng vấn tiếp theo?
          </h2>
          <p className="mt-3 text-blue-100">
            Đăng ký miễn phí và bắt đầu luyện tập ngay hôm nay.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 text-sm font-medium text-blue-600 hover:bg-gray-50"
          >
            Bắt đầu miễn phí
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-gray-500">
          InterviewPro &copy; 2026. AI 1:1 Video Interview Mentor.
        </div>
      </footer>
    </main>
  );
}
