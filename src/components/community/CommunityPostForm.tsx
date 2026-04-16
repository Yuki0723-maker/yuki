"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AGE_LABELS } from "@/lib/utils";

const TYPE_OPTIONS = [
  { value: "activity_idea", label: "活動アイデア" },
  { value: "discussion", label: "掲示板" },
];

export function CommunityPostForm() {
  const router = useRouter();
  const [type, setType] = useState("activity_idea");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { setError("内容を入力してください"); return; }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title: title || null,
        content,
        targetAge: age === "" ? null : age,
        tags: tags.split(/[,、\s]+/).filter(Boolean),
      }),
    });

    if (!res.ok) {
      setError("投稿に失敗しました");
      setSubmitting(false);
      return;
    }

    router.push("/community");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <label className="block text-sm font-semibold text-gray-800 mb-3">投稿タイプ</label>
        <div className="flex gap-2">
          {TYPE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
                type === value
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">タイトル（任意）</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：雨の日の室内遊び：新聞紙ビリビリ"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            内容 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="活動内容・子どもの反応・工夫したことなど"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-y leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">対象年齢（任意）</label>
            <select
              value={age}
              onChange={(e) => setAge(e.target.value === "" ? "" : parseInt(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">全年齢</option>
              {Object.entries(AGE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">タグ（任意）</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="砂場遊び, 3歳児"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-green-600 text-white rounded-2xl font-bold text-base py-4 hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
        style={{ minHeight: "56px" }}
      >
        {submitting ? "投稿中..." : "投稿する"}
      </button>
    </form>
  );
}
