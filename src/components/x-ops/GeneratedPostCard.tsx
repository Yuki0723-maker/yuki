"use client";

import { useState } from "react";

const TONE_LABELS: Record<string, string> = {
  casual: "カジュアル",
  professional: "プロフェッショナル",
  educational: "教育的",
  engaging: "エンゲージメント",
};

const TONE_COLORS: Record<string, string> = {
  casual: "bg-orange-50 text-orange-700",
  professional: "bg-slate-50 text-slate-700",
  educational: "bg-purple-50 text-purple-700",
  engaging: "bg-pink-50 text-pink-700",
};

interface Props {
  post: {
    id: string;
    content: string;
    tone: string;
    createdAt: string;
  };
}

export function GeneratedPostCard({ post }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(post.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = post.content.length;
  const isOver = charCount > 140;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            TONE_COLORS[post.tone] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {TONE_LABELS[post.tone] ?? post.tone}
        </span>
        <span className={`text-xs font-mono ${isOver ? "text-red-500" : "text-gray-400"}`}>
          {charCount} / 140
        </span>
      </div>

      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-4">
        {post.content}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={copy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          {copied ? "✓ コピー済み" : "コピー"}
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-black hover:bg-gray-800 text-white transition-colors"
        >
          X で投稿
        </a>
      </div>
    </div>
  );
}
