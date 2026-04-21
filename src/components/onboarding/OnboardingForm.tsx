"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AGE_OPTIONS = [
  { value: 0, label: "0歳児" },
  { value: 1, label: "1歳児" },
  { value: 2, label: "2歳児" },
  { value: 3, label: "3歳児" },
  { value: 4, label: "4歳児" },
  { value: 5, label: "5歳児" },
];

export function OnboardingForm() {
  const router = useRouter();
  const [targetAge, setTargetAge] = useState<number | null>(null);
  const [classSize, setClassSize] = useState("");
  const [teachingStyle, setTeachingStyle] = useState("");
  const [childrenNote, setChildrenNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (targetAge === null) {
      setError("担当クラスの年齢を選んでください");
      return;
    }
    setSaving(true);
    await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetAge,
        classSize: classSize ? parseInt(classSize) : null,
        teachingStyle: teachingStyle || null,
        childrenNote: childrenNote || null,
      }),
    });
    router.push("/plans");
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {/* 年齢選択 */}
      <div>
        <label className="block text-sm font-semibold text-[#3d2b1f] mb-2">
          担当クラスの年齢 <span className="text-[#d4845a]">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {AGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setTargetAge(opt.value); setError(""); }}
              className={`py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                targetAge === opt.value
                  ? "bg-[#3d2b1f] text-[#f5f0e8] border-[#3d2b1f]"
                  : "bg-white text-[#8a6a50] border-[#ddd0b8] hover:border-[#d4845a]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {/* 人数 */}
      <div>
        <label className="block text-sm font-semibold text-[#3d2b1f] mb-1">
          子どもの人数 <span className="text-[#b09070] font-normal">（任意）</span>
        </label>
        <input
          type="number"
          value={classSize}
          onChange={e => setClassSize(e.target.value)}
          min={1}
          max={40}
          placeholder="例：20"
          className="w-full border border-[#ddd0b8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4845a] text-[#3d2b1f]"
        />
      </div>

      {/* 保育スタイル */}
      <div>
        <label className="block text-sm font-semibold text-[#3d2b1f] mb-1">
          大切にしている保育スタイル <span className="text-[#b09070] font-normal">（任意）</span>
        </label>
        <textarea
          value={teachingStyle}
          onChange={e => setTeachingStyle(e.target.value)}
          rows={2}
          placeholder="例：子どもの主体性を大切に、遊びを通じた学びを重視しています"
          className="w-full border border-[#ddd0b8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4845a] resize-none text-[#3d2b1f] placeholder-[#c4aa8a]"
        />
      </div>

      {/* 子どもたちの傾向 */}
      <div>
        <label className="block text-sm font-semibold text-[#3d2b1f] mb-1">
          子どもたちの傾向・気になること <span className="text-[#b09070] font-normal">（任意）</span>
        </label>
        <textarea
          value={childrenNote}
          onChange={e => setChildrenNote(e.target.value)}
          rows={2}
          placeholder="例：活発な子が多く、言葉で気持ちを伝えることが難しい子が数名います"
          className="w-full border border-[#ddd0b8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4845a] resize-none text-[#3d2b1f] placeholder-[#c4aa8a]"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-[#3d2b1f] text-[#f5f0e8] font-bold py-3.5 rounded-xl hover:bg-[#5c3d2e] transition-colors disabled:opacity-50 cursor-pointer text-base"
      >
        {saving ? "登録中..." : "登録して始める"}
      </button>

      <p className="text-center text-xs text-[#b09070]">
        あとからマイページでいつでも変更できます
      </p>
    </div>
  );
}
