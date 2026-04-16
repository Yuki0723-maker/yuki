"use client";

import { useState } from "react";
import type { Plan, Visibility } from "@prisma/client";

interface Props {
  plan: Plan;
  noteId: string;
}

const SECTIONS = [
  { key: "aims" as const, label: "ねらい", icon: "🎯", color: "border-l-green-500" },
  { key: "content" as const, label: "内容", icon: "📚", color: "border-l-blue-500" },
  { key: "support" as const, label: "保育者の援助", icon: "🤝", color: "border-l-purple-500" },
  { key: "environment" as const, label: "環境構成", icon: "🏡", color: "border-l-orange-500" },
  { key: "evaluation" as const, label: "評価・反省", icon: "💭", color: "border-l-gray-400" },
] as const;

const VISIBILITY_OPTIONS: { value: Visibility; label: string; desc: string }[] = [
  { value: "PRIVATE", label: "🔒 非公開", desc: "自分のみ" },
  { value: "MEMBERS_ONLY", label: "👥 会員限定", desc: "登録者のみ" },
  { value: "PUBLIC", label: "🌐 全体公開", desc: "誰でも閲覧可" },
];

export function PlanEditor({ plan, noteId }: Props) {
  const [fields, setFields] = useState({
    aims: plan.aims,
    content: plan.content,
    support: plan.support,
    environment: plan.environment,
    evaluation: plan.evaluation ?? "",
  });
  const [visibility, setVisibility] = useState<Visibility>(plan.visibility);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, visibility }),
    });
    setSaving(false);
    setSaved(true);
    setEditingKey(null);
    setTimeout(() => setSaved(false), 3000);
  };

  const _ = noteId; // suppress unused warning

  return (
    <div className="space-y-4">
      {/* AI badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
            ✨ AI生成
          </span>
          {plan.isEdited && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
              編集済み
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-400"
          >
            {VISIBILITY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? "保存中..." : saved ? "✓ 保存済み" : "保存する"}
          </button>
        </div>
      </div>

      {/* Plan sections */}
      {SECTIONS.map(({ key, label, icon, color }) => (
        <div key={key} className={`bg-white rounded-2xl border-l-4 ${color} border border-gray-100 shadow-sm overflow-hidden`}>
          <div
            className="flex items-center justify-between px-5 py-3 cursor-pointer select-none"
            onClick={() => setEditingKey(editingKey === key ? null : key)}
          >
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <span>{icon}</span>
              {label}
            </h3>
            <button className="text-xs text-green-600 font-medium cursor-pointer hover:underline">
              {editingKey === key ? "完了" : "編集"}
            </button>
          </div>

          <div className="px-5 pb-4">
            {editingKey === key ? (
              <textarea
                value={fields[key]}
                onChange={(e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))}
                rows={key === "evaluation" ? 4 : 6}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-y leading-relaxed"
                placeholder={key === "evaluation" ? "評価・反省を入力（省略可）" : ""}
              />
            ) : (
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {fields[key] || <span className="text-gray-400 italic">未記入</span>}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Print button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => window.print()}
          className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 cursor-pointer"
        >
          🖨️ 印刷する
        </button>
      </div>
    </div>
  );
}
