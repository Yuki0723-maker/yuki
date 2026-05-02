import Link from "next/link";
import { db } from "@/lib/db";
import { IdeaCard } from "@/components/x-ops/IdeaCard";

export const dynamic = "force-dynamic";

export default async function XOpsDashboardPage() {
  const ideas = await db.xPostIdea.findMany({
    orderBy: { createdAt: "desc" },
    include: { generatedPosts: { select: { id: true } } },
  });

  const counts = {
    total: ideas.length,
    generated: ideas.filter((i) => i.status === "GENERATED" || i.status === "POSTED").length,
    posted: ideas.filter((i) => i.status === "POSTED").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-1">X 投稿のアイデアを管理・AI 生成します</p>
        </div>
        <Link
          href="/x-ops/ideas/new"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          ＋ アイデアを追加
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "アイデア合計", value: counts.total, color: "text-gray-900" },
          { label: "投稿文生成済み", value: counts.generated, color: "text-blue-600" },
          { label: "投稿済み", value: counts.posted, color: "text-green-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Ideas */}
      {ideas.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">💡</p>
          <p className="text-gray-500 mb-6">まだアイデアがありません</p>
          <Link
            href="/x-ops/ideas/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            最初のアイデアを追加する
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={{
                ...idea,
                createdAt: idea.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
