"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { maskPersonalInfo } from "@/lib/masking";
import { AGE_LABELS } from "@/lib/utils";
import { MaskingModal } from "./MaskingModal";
import { PlanResult } from "./PlanResult";

const PHRASE_CHIPS = [
  "砂場遊び", "製作活動", "友達とトラブル", "活発に動き回っていた",
  "静かに集中していた", "給食をよく食べた", "外遊びを嫌がった",
  "水遊び", "絵本の読み聞かせ", "音楽・リズム遊び", "運動遊び",
  "友だちとの関わりが増えた", "集団行動が難しそう", "発語が増えてきた",
];

export interface GeneratedPlanData {
  id: string;
  goal: string;
  content: string;
  environment: string;
  support: string;
  guidelineRef: string;
}

interface Template {
  id: string;
  name: string;
}

interface Props {
  templates: Template[];
  initialMemo?: string;
}

export function PlanForm({ templates, initialMemo = "" }: Props) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [age, setAge] = useState<number | "">("");
  const [memo, setMemo] = useState(initialMemo);
  const [nextMemo, setNextMemo] = useState("");
  const [maskedMemo, setMaskedMemo] = useState("");
  const [maskReplacements, setMaskReplacements] = useState<{ original: string; replacement: string }[]>([]);
  const [showMaskModal, setShowMaskModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<GeneratedPlanData | null>(null);
  const [error, setError] = useState("");

  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const toggleVoice = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("このブラウザは音声入力に対応していません");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SR() as any;
    rec.lang = "ja-JP";
    rec.continuous = true;
    rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results as Iterable<{ 0: { transcript: string } }>)
        .map((r) => r[0].transcript)
        .join("");
      setMemo((prev) => prev + (prev ? "\n" : "") + transcript);
    };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }, [listening]);

  const addPhrase = (phrase: string) => {
    setMemo((prev) => prev + (prev ? "\n" : "") + phrase);
    textareaRef.current?.focus();
  };

  const handleGenerate = () => {
    if (!memo.trim()) {
      setError("子どもの様子を入力してください");
      return;
    }
    if (age === "") {
      setError("クラスの年齢を選択してください");
      return;
    }
    setError("");
    const result = maskPersonalInfo(memo);
    setMaskedMemo(result.masked);
    setMaskReplacements(result.replacements);
    setShowMaskModal(true);
  };

  const handleConfirmMask = async (confirmedMemo: string) => {
    setShowMaskModal(false);
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ age, maskedMemo: confirmedMemo, nextWeekMemo: nextMemo }),
      });
      if (!res.ok) throw new Error("生成に失敗しました");
      const data = await res.json() as GeneratedPlanData;
      setPlan(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setGenerating(false);
    }
  };

  if (plan) {
    return <PlanResult plan={plan} templates={templates} onBack={() => setPlan(null)} />;
  }

  return (
    <div className="space-y-5">
      {/* Step 1: 年齢 */}
      <div className="bg-white rounded-3xl border border-pink-100 p-5 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          1. クラスの年齢 <span className="text-pink-400">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(AGE_LABELS).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setAge(Number(val))}
              className={`px-4 py-2 rounded-2xl text-sm font-medium border transition-all cursor-pointer ${
                age === Number(val)
                  ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white border-transparent shadow-md shadow-pink-100"
                  : "bg-white text-gray-500 border-pink-100 hover:border-pink-300 hover:text-pink-500"
              }`}
              style={{ minHeight: "44px" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: 週の様子 */}
      <div className="bg-white rounded-3xl border border-pink-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">
            2. 今週の子どもの様子 <span className="text-pink-400">*</span>
          </label>
          <button
            type="button"
            onClick={toggleVoice}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              listening
                ? "bg-red-50 text-red-500 border-red-200 animate-pulse"
                : "bg-pink-50 text-pink-500 border-pink-200 hover:bg-pink-100"
            }`}
          >
            🎤 {listening ? "停止" : "音声入力"}
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder={`タロウ 砂場 ずっと掘ってた\nハナちゃん 泣いてた、理由不明\n製作 のり使うの嫌がる子多い\n体言止め・走り書きOK`}
          rows={8}
          className="w-full border border-pink-100 rounded-2xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-300 resize-y leading-relaxed bg-pink-50/20"
        />
        <p className="text-xs text-gray-400 mt-2">{memo.length}文字</p>

        {/* フレーズチップ */}
        <div className="mt-3">
          <p className="text-xs text-gray-400 mb-2">よく使うフレーズ：</p>
          <div className="flex flex-wrap gap-1.5">
            {PHRASE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => addPhrase(chip)}
                className="text-xs px-3 py-1.5 rounded-full bg-pink-50 text-pink-500 border border-pink-100 hover:bg-pink-100 transition-colors cursor-pointer"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 3: 来週に向けて */}
      <div className="bg-white rounded-3xl border border-pink-100 p-5 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          3. 気になること・来週やりたいこと <span className="text-gray-400 font-normal">（任意）</span>
        </label>
        <textarea
          value={nextMemo}
          onChange={(e) => setNextMemo(e.target.value)}
          placeholder="来週は水遊びを予定。A の言葉の発達が気になる。"
          rows={3}
          className="w-full border border-pink-100 rounded-2xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-300 resize-y bg-pink-50/20"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-50 px-4 py-3 rounded-2xl">{error}</p>
      )}

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl font-bold text-lg hover:from-pink-500 hover:to-purple-500 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-pink-100"
        style={{ height: "60px" }}
      >
        {generating ? (
          <>
            <Spinner />
            AIが保育指針をもとに作成中...
          </>
        ) : (
          "✨ 週案を作る"
        )}
      </button>
      {generating && (
        <p className="text-center text-xs text-pink-300 animate-pulse">
          10〜30秒ほどお待ちください 🌸
        </p>
      )}

      {showMaskModal && (
        <MaskingModal
          original={memo}
          masked={maskedMemo}
          replacements={maskReplacements}
          onConfirm={handleConfirmMask}
          onClose={() => setShowMaskModal(false)}
        />
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
