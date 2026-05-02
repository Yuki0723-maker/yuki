"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SUGGESTED_TAGS = [
  "保育", "育児", "子育て", "幼児教育", "保育士",
  "遊び", "製作", "絵本", "自然", "食育",
  "行事", "季節", "発達", "コミュニケーション", "Tips",
];

interface Props {
  defaultValues?: { title: string; memo: string; tags: string[] };
  ideaId?: string;
}

export function IdeaForm({ defaultValues, ideaId }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [memo, setMemo] = useState(defaultValues?.memo ?? "");
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const [customTag, setCustomTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setCustomTag("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !memo.trim()) {
      setError("タイトルとメモは必須です");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const url = ideaId ? `/api/x-ops/ideas/${ideaId}` : "/api/x-ops/ideas";
      const method = ideaId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, memo, tags }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "保存に失敗しました");
      }

      const idea = await res.json() as { id: string };
      router.push(`/x-ops/ideas/${idea.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            タイトル <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：保育士のあるあるネタ、季節の製作アイデア..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-800 mb-2">
            メモ・詳細 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder={`伝えたいこと、参考にしたいエピソード、含めたいキーワードなどを自由に書いてください。\n\n例：\n・雨の日の室内遊びで子どもが楽しめるアイデア5選\n・段ボールや新聞紙など家にあるもので遊べる内容にしたい`}
            rows={6}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y leading-relaxed"
          />
          <p className="text-xs text-gray-400 mt-1">{memo.length}文字</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-800">タグ（任意）</h3>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                tags.includes(tag)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
            placeholder="カスタムタグを追加..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="button"
            onClick={addCustomTag}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-xl transition-colors cursor-pointer"
          >
            追加
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="hover:text-blue-900 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !title.trim() || !memo.trim()}
        className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-base hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading ? "保存中..." : ideaId ? "アイデアを更新する" : "アイデアを保存する"}
      </button>
    </form>
  );
}
