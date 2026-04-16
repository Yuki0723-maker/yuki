import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { PostCard } from "@/components/community/PostCard";

export const metadata: Metadata = { title: "コミュニティ" };

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; age?: string }>;
}) {
  const sp = await searchParams;
  const type = sp.type ?? "weekly_plan";

  const posts = await db.communityPost.findMany({
    where: {
      type,
      ...(sp.age ? { targetAge: parseInt(sp.age) } : {}),
    },
    include: {
      user: { select: { name: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">コミュニティ</h1>
        <Link
          href="/community/new"
          className="bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
        >
          ＋ 投稿する
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {[
          { key: "weekly_plan", label: "週案フィード" },
          { key: "activity_idea", label: "活動アイデア" },
          { key: "discussion", label: "掲示板" },
        ].map(({ key, label }) => (
          <Link
            key={key}
            href={`/community?type=${key}`}
            className={`flex-1 text-center text-sm font-medium py-2 rounded-lg transition-colors ${
              type === key
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-gray-400 text-sm">まだ投稿がありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
