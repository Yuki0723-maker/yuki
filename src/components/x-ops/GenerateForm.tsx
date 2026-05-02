"use client";

import { useState } from "react";
import type { XPostTone } from "@/lib/x-claude";

const TONE_OPTIONS: { value: XPostTone; label: string; desc: string; icon: string }[] = [
  { value: "casual", label: "カジュアル", desc: "親しみやすく気軽な文体", icon: "😊" },
  { value: "professional", label: "プロフェッショナル", desc: "信頼感のある丁寧な文体", icon: "💼" },
  { value: "educational", label: "教育的", desc: "情報・ノウハウを整理して伝える", icon: "📚" },
  { value: "engaging", label: "エンゲージメント", desc: "共感・RT・コメントを促す", icon: "✨" },
];

interface Props {
  ideaId: string;
  onGenerated: () => void;
}

export function GenerateForm({ ideaId, onGenerated }: Props) {
  const [tone, setTone] = useState<XPostTone>("casual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/x-ops/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId, tone }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "生成に失敗しました");
      }

      onGenerated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
      <h3 className="font-semibold text-gray-800">AI で投稿文を生成</h3>

      <div className="grid grid-cols-2 gap-2">
        {TONE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTone(opt.value)}
            className={`flex items-start gap-2 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              tone === opt.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <span className="text-lg">{opt.icon}</span>
            <div>
              <p className="text-sm font-medium text-gray-800">{opt.label}</p>
              <p className="text-xs text-gray-500">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Spinner />
            AI が投稿文を生成中...
          </>
        ) : (
          "✨ 投稿文を 3 パターン生成する"
        )}
      </button>
      {!loading && (
        <p className="text-center text-xs text-gray-400">生成には 10〜20 秒程度かかります</p>
      )}
    </div>
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
