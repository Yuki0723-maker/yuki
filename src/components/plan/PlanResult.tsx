"use client";

import { useState } from "react";
import { PdfModal } from "./PdfModal";

interface GeneratedPlanData {
  id: string;
  targetAge?: number;
  formatType?: string;
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
  plan: GeneratedPlanData;
  templates: Template[];
  onBack: () => void;
}

const SECTIONS = [
  { key: "goal" as const, label: "ねらい", color: "#d4845a" },
  { key: "content" as const, label: "内容", color: "#8a9a6a" },
  { key: "environment" as const, label: "環境構成", color: "#7a8fa8" },
  { key: "support" as const, label: "保育者の援助", color: "#a87aa8" },
];

export function PlanResult({ plan, templates, onBack }: Props) {
  const [fields, setFields] = useState({
    goal: plan.goal,
    content: plan.content,
    environment: plan.environment,
    support: plan.support,
  });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/plan/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, isPublic }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLineShare = async () => {
    const text = `週案が完成しました！\n\nねらい：${fields.goal.slice(0, 50)}...\n\n${location.origin}/plan/${plan.id}`;
    await fetch(`/api/plan/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, isPublic }),
    });
    window.open(`https://line.me/R/share?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="text-sm text-[#a85c38] hover:underline cursor-pointer"
        >
          ← 対話に戻る
        </button>
        <span className="bg-[#f0e8df] text-[#a85c38] text-xs font-bold px-2.5 py-1 rounded-full">
          AI生成
        </span>
      </div>

      {SECTIONS.map(({ key, label, color }) => (
        <div
          key={key}
          className="bg-white rounded-2xl border border-[#ece4d4] overflow-hidden"
          style={{ borderLeftWidth: "4px", borderLeftColor: color }}
        >
          <div
            className="flex items-center justify-between px-5 py-3 cursor-pointer select-none"
            onClick={() => setEditingKey(editingKey === key ? null : key)}
          >
            <h3 className="font-semibold text-[#3d2b1f] text-sm">{label}</h3>
            <span className="text-xs text-[#a85c38] font-medium cursor-pointer hover:underline">
              {editingKey === key ? "完了" : "編集"}
            </span>
          </div>
          <div className="px-5 pb-4">
            {editingKey === key ? (
              <textarea
                value={fields[key]}
                onChange={e => setFields(p => ({ ...p, [key]: e.target.value }))}
                rows={6}
                className="w-full border border-[#ece4d4] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4845a] resize-y leading-relaxed bg-[#faf8f3] text-[#3d2b1f]"
              />
            ) : (
              <p className="text-sm text-[#5c3d2e] leading-relaxed whitespace-pre-wrap">{fields[key]}</p>
            )}
          </div>
        </div>
      ))}

      <p className="text-xs text-[#b09070] text-right">根拠：{plan.guidelineRef}</p>

      {/* 公開トグル */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-[#ece4d4] px-5 py-3">
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={() => setIsPublic(p => !p)}
          className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
            isPublic ? "bg-[#d4845a]" : "bg-[#ddd0b8]"
          }`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? "translate-x-5" : "translate-x-1"}`} />
        </button>
        <span className="text-sm text-[#5c3d2e]">コミュニティに公開する</span>
      </div>

      {/* アクションボタン */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="col-span-3 bg-[#3d2b1f] text-[#f5f0e8] font-bold py-4 rounded-xl text-base hover:bg-[#5c3d2e] transition-colors disabled:opacity-50 cursor-pointer"
          style={{ minHeight: "52px" }}
        >
          {saving ? "保存中..." : saved ? "保存しました" : "保存する"}
        </button>
        <button
          onClick={() => setShowPdf(true)}
          className="border border-[#ece4d4] text-[#5c3d2e] text-sm font-medium py-3 rounded-xl hover:bg-[#faf8f3] cursor-pointer transition-colors"
          style={{ minHeight: "44px" }}
        >
          PDF出力
        </button>
        <button
          onClick={handleLineShare}
          className="border border-[#ece4d4] text-[#5c3d2e] text-sm font-medium py-3 rounded-xl hover:bg-[#faf8f3] cursor-pointer transition-colors"
          style={{ minHeight: "44px" }}
        >
          LINEに送る
        </button>
        <button
          onClick={() => window.print()}
          className="border border-[#ece4d4] text-[#5c3d2e] text-sm font-medium py-3 rounded-xl hover:bg-[#faf8f3] cursor-pointer transition-colors"
          style={{ minHeight: "44px" }}
        >
          印刷
        </button>
      </div>

      {showPdf && (
        <PdfModal planId={plan.id} templates={templates} onClose={() => setShowPdf(false)} />
      )}
    </div>
  );
}
