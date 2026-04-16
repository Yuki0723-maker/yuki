"use client";

import { useState } from "react";
import { PdfModal } from "./PdfModal";
import type { GeneratedPlanData } from "./PlanForm";

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
  { key: "goal" as const, label: "ねらい", icon: "🎯", color: "border-l-green-500" },
  { key: "content" as const, label: "内容", icon: "📚", color: "border-l-blue-500" },
  { key: "environment" as const, label: "環境構成", icon: "🏡", color: "border-l-orange-500" },
  { key: "support" as const, label: "保育者の援助", icon: "🤝", color: "border-l-purple-500" },
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
    const text = `📋 週案が完成しました！\n\nねらい：${fields.goal.slice(0, 50)}...\n\n${location.origin}/plan/${plan.id}`;
    await fetch(`/api/plan/${plan.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, isPublic }) });
    window.open(`https://line.me/R/share?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="text-sm text-green-600 hover:underline cursor-pointer">
          ← 入力に戻る
        </button>
        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
          ✨ AI生成
        </span>
      </div>

      {/* 編集可能フィールド */}
      {SECTIONS.map(({ key, label, icon, color }) => (
        <div
          key={key}
          className={`bg-white rounded-2xl border-l-4 ${color} border border-gray-100 shadow-sm overflow-hidden`}
        >
          <div
            className="flex items-center justify-between px-5 py-3 cursor-pointer select-none"
            onClick={() => setEditingKey(editingKey === key ? null : key)}
          >
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
              <span>{icon}</span>
              {label}
            </h3>
            <span className="text-xs text-green-600 font-medium cursor-pointer hover:underline">
              {editingKey === key ? "完了" : "編集"}
            </span>
          </div>
          <div className="px-5 pb-4">
            {editingKey === key ? (
              <textarea
                value={fields[key]}
                onChange={(e) => setFields((p) => ({ ...p, [key]: e.target.value }))}
                rows={6}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-y leading-relaxed"
              />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {fields[key]}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* 保育指針の根拠 */}
      <p className="text-xs text-gray-400 text-right">根拠：{plan.guidelineRef}</p>

      {/* 公開トグル */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-5 py-3">
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={() => setIsPublic((p) => !p)}
          className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
            isPublic ? "bg-green-500" : "bg-gray-200"
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              isPublic ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm text-gray-700">コミュニティに公開する</span>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="col-span-3 bg-green-600 text-white font-bold py-4 rounded-2xl text-base hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
          style={{ minHeight: "56px" }}
        >
          {saving ? "保存中..." : saved ? "✓ 保存しました！" : "💾 保存する"}
        </button>
        <button
          onClick={() => setShowPdf(true)}
          className="border border-gray-200 text-gray-700 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 cursor-pointer"
          style={{ minHeight: "48px" }}
        >
          📄 PDF出力
        </button>
        <button
          onClick={handleLineShare}
          className="border border-green-200 text-green-700 text-sm font-medium py-3 rounded-xl hover:bg-green-50 cursor-pointer"
          style={{ minHeight: "48px" }}
        >
          💬 LINEに送る
        </button>
        <button
          onClick={() => window.print()}
          className="border border-gray-200 text-gray-600 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 cursor-pointer"
          style={{ minHeight: "48px" }}
        >
          🖨️ 印刷
        </button>
      </div>

      {showPdf && (
        <PdfModal
          planId={plan.id}
          templates={templates}
          onClose={() => setShowPdf(false)}
        />
      )}
    </div>
  );
}
