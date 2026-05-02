import Link from "next/link";

const STATUS_LABELS = {
  IDEA: { label: "アイデア", color: "bg-gray-100 text-gray-600" },
  GENERATED: { label: "生成済み", color: "bg-blue-100 text-blue-700" },
  POSTED: { label: "投稿済み", color: "bg-green-100 text-green-700" },
} as const;

interface Props {
  idea: {
    id: string;
    title: string;
    memo: string;
    tags: string[];
    status: "IDEA" | "GENERATED" | "POSTED";
    createdAt: string;
    generatedPosts?: { id: string }[];
  };
}

export function IdeaCard({ idea }: Props) {
  const status = STATUS_LABELS[idea.status];
  const postCount = idea.generatedPosts?.length ?? 0;

  return (
    <Link href={`/x-ops/ideas/${idea.id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug flex-1">{idea.title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${status.color}`}>
            {status.label}
          </span>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{idea.memo}</p>

        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {idea.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
            {idea.tags.length > 4 && (
              <span className="text-xs text-gray-400">+{idea.tags.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{new Date(idea.createdAt).toLocaleDateString("ja-JP")}</span>
          {postCount > 0 && <span>投稿文 {postCount}件</span>}
        </div>
      </div>
    </Link>
  );
}
