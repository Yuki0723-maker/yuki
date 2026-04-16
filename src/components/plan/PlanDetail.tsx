"use client";

import { useState } from "react";
import Link from "next/link";
import { formatWeekRange, AGE_LABELS } from "@/lib/utils";
import { PdfModal } from "./PdfModal";
import type { WeeklyPlan } from "@prisma/client";

interface Template {
  id: string;
  name: string;
}

interface Props {
  plan: WeeklyPlan;
  templates: Template[];
}

const SECTIONS = [
  { key: "goal" as const, label: "ねらい", icon: "🎯", color: "border-l-green-500" },
  { key: "content" as const, label: "内容", icon: "📚", color: "border-l-blue-500" },
  { key: "environment" as const, label: "環境構成", icon: "🏡", color: "border-l-orange-500" },
  { key: "support" as const, label: "保育者の援助", icon: "🤝", color: "border-l-purple-500" },
];

export function PlanDetail({ plan, templates }: Props) {
  const [fields, setFields] = useState({
    goal: plan.goal,
    content: plan.content,
    environment: plan.environment,
    support: plan.support,
  });
  const [isPublic, setIsPublic] = useState(plan.isPublic);
  const [editingKey, setEditingKey] = useState<string | null>(null);
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

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/plans" className="text-sm text-green-600 hover:underline">
          ← ホームに戻る
        </Link>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {AGE_LABELS[plan.targetAge]}
          </span>
          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
            ✨ AI生成
          </span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          {formatWeekRange(plan.weekStartDate)}の週案
        </h1>
      </div>

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

      <p className="text-xs text-gray-400 text-right">根拠：{plan.guidelineRef}</p>

      {/* 元メモ */}
      <details className="bg-amber-50 border border-amber-100 rounded-2xl">
        <summary className="px-5 py-3 cursor-pointer text-sm font-medium text-amber-800 select-none">
          📝 入力した内容を見る
        </summary>
        <p className="px-5 pb-4 text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
          {plan.rawMemo}
        </p>
      </details>

      {/* 公開トグル */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-5 py-3">
        <button
          type="button"
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
          onClick={() => {
            const text = `📋 週案\n\nねらい：${fields.goal.slice(0, 50)}...\n\n${location.href}`;
            window.open(`https://line.me/R/share?text=${encodeURIComponent(text)}`, "_blank");
          }}
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
        <PdfModal planId={plan.id} templates={templates} onClose={() => setShowPdf(false)} />
      )}
    </div>
  );
}
