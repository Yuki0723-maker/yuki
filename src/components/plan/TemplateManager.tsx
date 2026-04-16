"use client";

import { useState, useRef } from "react";
import type { PlanTemplate } from "@prisma/client";

interface Props {
  templates: PlanTemplate[];
}

export function TemplateManager({ templates: initial }: Props) {
  const [templates, setTemplates] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      setError("PDFファイルを選択してください");
      return;
    }
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("name", file.name.replace(".pdf", ""));
    try {
      const res = await fetch("/api/template/analyze", { method: "POST", body: form });
      if (!res.ok) throw new Error("解析に失敗しました");
      const data = await res.json() as PlanTemplate;
      setTemplates((prev) => [data, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このテンプレートを削除しますか？")) return;
    // APIエンドポイント省略（DELETE /api/template/[id]）
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
          dragOver ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-green-300 bg-white"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {uploading ? (
          <div className="space-y-2">
            <div className="text-3xl animate-spin">⚙️</div>
            <p className="text-sm text-gray-500">AIがレイアウトを解析中...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-3xl">📄</div>
            <p className="text-sm font-semibold text-gray-700">
              PDFをドラッグ&ドロップ
            </p>
            <p className="text-xs text-gray-400">またはクリックしてファイルを選択</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
      )}

      {/* Template list */}
      {templates.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          テンプレートはまだありません
        </p>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4"
            >
              <div>
                <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(t.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
              <button
                onClick={() => handleDelete(t.id)}
                className="text-xs text-red-400 hover:text-red-600 cursor-pointer px-2 py-1"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
