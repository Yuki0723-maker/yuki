import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="text-xl font-bold text-green-800">HoikuNote</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            ログイン
          </Link>
          <Link
            href="/register"
            className="text-sm bg-green-600 text-white px-4 py-2 rounded-full font-medium hover:bg-green-700 transition-colors"
          >
            無料で始める
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span>✨</span>
          <span>AI × 保育の新しいカタチ</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          週の様子を書くだけで
          <br />
          <span className="text-green-600">指導計画が完成</span>する
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          HoikuNoteは、保育士さんの日々の記録をAIが分析し、保育所保育指針に準拠した指導計画（ねらい・内容・援助・環境構成）を自動生成。全国の保育士と活動アイデアを共有できるコミュニティプラットフォームです。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="bg-green-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-green-700 transition-colors text-base"
          >
            無料で始める →
          </Link>
          <Link
            href="/login"
            className="border border-gray-200 text-gray-700 px-8 py-3.5 rounded-full font-semibold hover:bg-gray-50 transition-colors text-base"
          >
            ログイン
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "✍️",
              title: "書くのは週の様子だけ",
              desc: "子どもたちの様子を自由記述するだけ。AIが保育所保育指針に準拠した指導計画を自動生成します。",
            },
            {
              icon: "🤝",
              title: "全国の保育士と共有",
              desc: "活動アイデアや週案を会員間で共有。年齢別・テーマ別の掲示板で悩みを解決できます。",
            },
            {
              icon: "🔒",
              title: "個人情報は守られる",
              desc: "子どもの名前・園名などの個人情報はフィードに公開されません。公開範囲を自分で設定できます。",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © 2025 HoikuNote. All rights reserved.
      </footer>
    </main>
  );
}
