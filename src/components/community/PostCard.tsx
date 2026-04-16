import Link from "next/link";
import { AGE_LABELS } from "@/lib/utils";

interface Post {
  id: string;
  type: string;
  targetAge: number | null;
  title: string | null;
  content: string;
  tags: string[];
  createdAt: Date;
  user: { name: string | null; avatarUrl: string | null };
  _count: { likes: number; comments: number };
}

export function PostCard({ post }: { post: Post }) {
  const preview = post.content.slice(0, 120) + (post.content.length > 120 ? "..." : "");

  return (
    <Link href={`/community/${post.id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-green-200 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
            {(post.user.name ?? "?")[0]}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">{post.user.name ?? "保育士さん"}</p>
            <p className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleDateString("ja-JP")}
            </p>
          </div>
          {post.targetAge !== null && (
            <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {AGE_LABELS[post.targetAge]}
            </span>
          )}
        </div>

        {post.title && (
          <h3 className="text-sm font-bold text-gray-900 mb-1">{post.title}</h3>
        )}

        <p className="text-sm text-gray-700 leading-relaxed">{preview}</p>

        {post.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-3">
            {post.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-3 text-xs text-gray-400">
          <span>❤️ {post._count.likes}</span>
          <span>💬 {post._count.comments}</span>
        </div>
      </div>
    </Link>
  );
}
