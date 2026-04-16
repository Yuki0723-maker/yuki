"use client";

import { useState } from "react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
}

interface Props {
  planId: string;
  templates: Template[];
  onClose: () => void;
}

export function PdfModal({ planId, templates, onClose }: Props) {
  const [selected, setSelected] = useState<string>("default");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/plan/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          templateId: selected === "default" ? undefined : selected,
        }),
      });
      if (!res.ok) throw new Error("PDF生成に失敗しました");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `weekly-plan-${planId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch (e) {
      alert(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">PDFのフォーマットを選んでください</h2>
        <p className="text-xs text-gray-500 mb-4">
          フォーマットを追加するには
          <Link href="/settings/templates" className="text-green-600 hover:underline ml-1" onClick={onClose}>
            こちら
          </Link>
        </p>

        <div className="space-y-2 mb-6">
          <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="template"
              value="default"
              checked={selected === "default"}
              onChange={() => setSelected("default")}
              className="accent-green-600"
            />
            <span className="text-sm text-gray-800">デフォルト（シンプルA4）</span>
          </label>

          {templates.map((t) => (
            <label
              key={t.id}
              className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="template"
                value={t.id}
                checked={selected === t.id}
                onChange={() => setSelected(t.id)}
                className="accent-green-600"
              />
              <span className="text-sm text-gray-800">{t.name}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 cursor-pointer"
          >
            キャンセル
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-700 cursor-pointer disabled:opacity-50"
          >
            {loading ? "生成中..." : "このフォーマットで出力"}
          </button>
        </div>
      </div>
    </div>
  );
}
