import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "ログイン" };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/plans");

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-pink-300 via-pink-200 to-purple-200 items-center justify-center relative overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-20 w-20 h-20 bg-pink-100/40 rounded-full blur-xl" />
        <div className="text-center text-white z-10 px-12">
          <div className="text-7xl mb-6">🌸</div>
          <h2 className="text-3xl font-bold mb-4 drop-shadow">HoikuNote</h2>
          <p className="text-lg text-white/90 leading-relaxed">
            子どもたちの毎日を記録して<br />
            AIが週案を自動作成してくれる<br />
            保育士さんのためのアプリ
          </p>
          <div className="flex justify-center gap-4 mt-8 text-4xl">
            <span>🌷</span>
            <span>✨</span>
            <span>🌷</span>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-6 bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-3xl">🌸</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                HoikuNote
              </span>
            </Link>
            <p className="mt-2 text-sm text-pink-400">保育士さんのためのAI週案アシスタント</p>
          </div>
          <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
