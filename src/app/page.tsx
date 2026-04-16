import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/plans");

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="text-xl font-bold text-green-800">HoikuNote</span>
        </div>
        <Link
          href="/login"
          className="bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-green-700 transition-colors"
          style={{ minHeight: "44px", display: "flex", alignItems: "center" }}
        >
          Googleでログイン
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          <span>✨</span>
          <span>入力30秒、週案5分で完成</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          走り書きメモが
          <br />
          <span className="text-green-600">指導計画に変わる</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          保育士が子どもたちの様子を書くだけで、AIが保育指針に準拠した週案（ねらい・内容・環境・援助）を自動作成。
          LINEで送ってもOK。各園のフォーマットでPDF出力も可能。
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition-colors"
          style={{ minHeight: "56px" }}
        >
          無料で始める →
        </Link>
        <p className="mt-3 text-xs text-gray-400">Googleアカウントで即時登録・完全無料</p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "✍️",
              title: "書くのは子どもの様子だけ",
              desc: "体言止め・走り書きOK。LINEで送るだけでも保存されます。AIが保育指針に準拠した週案を自動生成。",
            },
            {
              icon: "📄",
              title: "園のフォーマットでPDF出力",
              desc: "自園の週案・月案フォーマットPDFをアップロードするだけで、そのレイアウトで印刷できます。",
            },
            {
              icon: "🤝",
              title: "全国の保育士とつながる",
              desc: "活動アイデアや保育の悩みを全国の仲間と共有。個人名・園名は自動マスキング。",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="font-bold text-gray-800 mb-2 text-base">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © 2025 HoikuNote. All rights reserved.
      </footer>
    </main>
  );
}
