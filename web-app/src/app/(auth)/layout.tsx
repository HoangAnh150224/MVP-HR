"use client";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">InterviewPro</h1>
          <p className="mt-1 text-sm text-gray-500">
            AI Interview Mentor
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
