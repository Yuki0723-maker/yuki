"use client";

import { useState } from "react";

interface Props {
  original: string;
  masked: string;
  replacements: { original: string; replacement: string }[];
  onConfirm: (finalMemo: string) => void;
  onClose: () => void;
}

export function MaskingModal({ original, masked, replacements, onConfirm, onClose }: Props) {
  const [editedMemo, setEditedMemo] = useState(masked);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            🔒 個人情報のマスキング確認
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            AIに送信する前に、個人情報が適切に置換されているか確認してください。
          </p>

          {replacements.length > 0 ? (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-yellow-800 mb-2">置換一覧：</p>
              <ul className="space-y-1">
                {replacements.map((r, i) => (
                  <li key={i} className="text-xs text-yellow-900 flex items-center gap-2">
                    <span className="line-through text-gray-400">{r.original}</span>
                    <span>→</span>
                    <span className="font-semibold">{r.replacement}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-800">
              ✅ 個人情報は検出されませんでした
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">入力内容</p>
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 whitespace-pre-wrap leading-relaxed min-h-[120px]">
                {original}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">AIに送る内容（編集可）</p>
              <textarea
                value={editedMemo}
                onChange={(e) => setEditedMemo(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-800 resize-y leading-relaxed min-h-[120px] focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 cursor-pointer"
            >
              キャンセル
            </button>
            <button
              onClick={() => onConfirm(editedMemo)}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-700 cursor-pointer"
              style={{ minHeight: "48px" }}
            >
              このまま送る →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
