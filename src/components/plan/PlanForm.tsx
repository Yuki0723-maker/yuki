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
    <div className="space-y-4">
      {/* Step 1: 年齢 */}
      <div className="bg-white rounded-2xl border border-[#ece4d4] p-5">
        <label className="block text-sm font-semibold text-[#3d2b1f] mb-3">
          1. クラスの年齢 <span className="text-[#d4845a]">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(AGE_LABELS).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setAge(Number(val))}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
                age === Number(val)
                  ? "bg-[#3d2b1f] text-[#f5f0e8] border-[#3d2b1f]"
                  : "bg-white text-[#8a6a50] border-[#ddd0b8] hover:border-[#d4845a] hover:text-[#a85c38]"
              }`}
              style={{ minHeight: "40px" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: 週の様子 */}
      <div className="bg-white rounded-2xl border border-[#ece4d4] p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-[#3d2b1f]">
            2. 今週の子どもの様子 <span className="text-[#d4845a]">*</span>
          </label>
          <button
            type="button"
            onClick={toggleVoice}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
              listening
                ? "bg-red-50 text-red-500 border-red-200 animate-pulse"
                : "bg-[#faf8f3] text-[#8a6a50] border-[#ddd0b8] hover:border-[#d4845a]"
            }`}
          >
            <MicIcon /> {listening ? "停止" : "音声入力"}
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder={`タロウ 砂場 ずっと掘ってた\nハナちゃん 泣いてた、理由不明\n製作 のり使うの嫌がる子多い\n体言止め・走り書きOK`}
          rows={8}
          className="w-full border border-[#ece4d4] rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#d4845a] resize-y leading-relaxed bg-[#faf8f3] text-[#3d2b1f] placeholder-[#c4aa8a]"
        />
        <p className="text-xs text-[#c4aa8a] mt-2">{memo.length}文字</p>

        <div className="mt-3">
          <p className="text-xs text-[#b09070] mb-2">よく使うフレーズ：</p>
          <div className="flex flex-wrap gap-1.5">
            {PHRASE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => addPhrase(chip)}
                className="text-xs px-3 py-1.5 rounded-full bg-[#faf8f3] text-[#8a6a50] border border-[#ddd0b8] hover:border-[#d4845a] hover:text-[#a85c38] transition-colors cursor-pointer"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 3: 来週に向けて */}
      <div className="bg-white rounded-2xl border border-[#ece4d4] p-5">
        <label className="block text-sm font-semibold text-[#3d2b1f] mb-3">
          3. 気になること・来週やりたいこと <span className="text-[#b09070] font-normal">（任意）</span>
        </label>
        <textarea
          value={nextMemo}
          onChange={(e) => setNextMemo(e.target.value)}
          placeholder="来週は水遊びを予定。A の言葉の発達が気になる。"
          rows={3}
          className="w-full border border-[#ece4d4] rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#d4845a] resize-y bg-[#faf8f3] text-[#3d2b1f] placeholder-[#c4aa8a]"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className="w-full bg-[#3d2b1f] text-[#f5f0e8] rounded-xl font-bold text-base hover:bg-[#5c3d2e] transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        style={{ height: "56px" }}
      >
        {generating ? (
          <>
            <Spinner />
            AIが保育指針をもとに作成中...
          </>
        ) : (
          "週案を生成する"
        )}
      </button>
      {generating && (
        <p className="text-center text-xs text-[#b09070] animate-pulse">
          10〜30秒ほどお待ちください
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
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="3.5" y="0.5" width="5" height="7" rx="2.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1.5 6C1.5 8.5 10.5 8.5 10.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="6" y1="9" x2="6" y2="11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
