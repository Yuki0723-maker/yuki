import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "投稿詳細" };

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await db.communityPost.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, avatarUrl: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { post: false },
      },
      _count: { select: { likes: true } },
    },
  });

  if (!post) notFound();

  const TYPE_LABELS: Record<string, string> = {
    weekly_plan: "週案フィード",
    activity_idea: "活動アイデア",
    discussion: "掲示板",
  };

  return (
    <div className="max-w-2xl space-y-6 p-6">
      <Link href="/community" className="text-sm text-green-600 hover:underline">
        ← コミュニティに戻る
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
            {(post.user.name ?? "?")[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{post.user.name ?? "保育士さん"}</p>
            <p className="text-xs text-gray-400">
              {TYPE_LABELS[post.type]} ·{" "}
              {new Date(post.createdAt).toLocaleDateString("ja-JP")}
            </p>
          </div>
        </div>

        {post.title && (
          <h1 className="text-lg font-bold text-gray-900 mb-3">{post.title}</h1>
        )}

        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {post.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-4">
            {post.tags.map((tag) => (
              <span key={tag} className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-500">
          <span>❤️ {post._count.likes}</span>
          <Link
            href={`/plan/new?text=${encodeURIComponent(post.content)}`}
            className="text-green-600 font-medium hover:underline"
          >
            この文言を週案に使う →
          </Link>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-3">
        <h2 className="font-bold text-gray-800">コメント ({post.comments.length})</h2>
        {post.comments.length === 0 ? (
          <p className="text-sm text-gray-400">まだコメントはありません</p>
        ) : (
          post.comments.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 text-sm text-gray-700">
              {c.content}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
