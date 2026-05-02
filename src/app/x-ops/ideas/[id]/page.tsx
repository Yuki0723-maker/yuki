import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { GeneratedPostCard } from "@/components/x-ops/GeneratedPostCard";
import { IdeaDetailClient } from "./IdeaDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function IdeaDetailPage({ params }: Props) {
  const { id } = await params;

  const idea = await db.xPostIdea.findUnique({
    where: { id },
    include: { generatedPosts: { orderBy: { createdAt: "desc" } } },
  });

  if (!idea) notFound();

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/x-ops" className="text-gray-400 hover:text-gray-600 text-sm">
          ← ダッシュボード
        </Link>
      </div>

      {/* Idea detail */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-gray-900">{idea.title}</h1>
          <Link
            href={`/x-ops/ideas/${id}/edit`}
            className="text-xs text-gray-400 hover:text-blue-600 border border-gray-200 px-3 py-1 rounded-lg transition-colors shrink-0"
          >
            編集
          </Link>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">{idea.memo}</p>
        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {idea.tags.map((tag) => (
              <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Generate */}
      <IdeaDetailClient ideaId={id} />

      {/* Generated posts */}
      {idea.generatedPosts.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-800">生成済み投稿文（{idea.generatedPosts.length}件）</h2>
          {idea.generatedPosts.map((post) => (
            <GeneratedPostCard
              key={post.id}
              post={{ ...post, createdAt: post.createdAt.toISOString() }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
