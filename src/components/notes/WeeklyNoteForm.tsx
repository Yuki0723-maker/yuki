"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AGE_GROUP_LABELS, SEASON_LABELS, getWeekStart, getSeason } from "@/lib/utils";
import type { AgeGroup } from "@prisma/client";

const AGE_GROUP_OPTIONS = Object.entries(AGE_GROUP_LABELS) as [AgeGroup, string][];
const SEASON_OPTIONS = Object.entries(SEASON_LABELS);

const SUGGESTED_THEMES = [
  "自然遊び", "製作", "絵本", "音楽・リズム", "運動遊び",
  "水遊び", "どろんこ遊び", "ごっこ遊び", "積み木", "粘土",
  "散歩", "行事", "食育", "友だちとの関わり", "言葉遊び",
];

export function WeeklyNoteForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | "">("");
  const [season, setSeason] = useState(getSeason());
  const [themes, setThemes] = useState<string[]>([]);
  const [weekStart] = useState(getWeekStart().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleTheme = (theme: string) => {
    setThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length < 20) {
      setError("週の様子を20文字以上入力してください");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          ageGroup: ageGroup || null,
          season,
          themes,
          weekStart,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "保存に失敗しました");
      }

      const note = await res.json() as { id: string };
      router.push(`/notes/${note.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 週の様子 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <label className="block font-semibold text-gray-800 mb-3">
          今週の子どもたちの様子 <span className="text-red-400">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`例：\n・砂場で友だちと一緒に山を作るなど、協力して遊ぶ姿が見られた。\n・カタツムリを見つけて「なんで殻があるの？」と質問するなど、生き物への興味が高まっている。\n・製作では、ハサミを上手に使えるようになってきた子が増えた。`}
          rows={8}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-y leading-relaxed"
        />
        <p className="text-xs text-gray-400 mt-2">
          {content.length}文字 ／ 個人名・園名の記載は不要です
        </p>
      </div>

      {/* メタ情報 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-800">詳細設定</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">対象年齢</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as AgeGroup | "")}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">選択（任意）</option>
              {AGE_GROUP_OPTIONS.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">季節</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {SEASON_OPTIONS.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">テーマ・活動の種類</label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_THEMES.map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => toggleTheme(theme)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  themes.includes(theme)
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="w-full bg-green-600 text-white rounded-xl py-3.5 font-semibold text-base hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Spinner />
            AIが指導計画を作成中...
          </>
        ) : (
          "✨ AIで指導計画を作成する"
        )}
      </button>
      <p className="text-center text-xs text-gray-400">
        生成には10〜30秒程度かかります
      </p>
    </form>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
