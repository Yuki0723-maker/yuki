"use client";

import { useState } from "react";
import { AGE_LABELS } from "@/lib/utils";

interface Props {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    targetAge?: number | null;
    bio?: string | null;
    classSize?: number | null;
    teachingStyle?: string | null;
    childrenNote?: string | null;
  };
  lineLinked: boolean;
}

export function ProfileForm({ user, lineLinked }: Props) {
  const [name, setName] = useState(user.name ?? "");
  const [targetAge, setTargetAge] = useState<number | "">(user.targetAge ?? "");
  const [classSize, setClassSize] = useState<number | "">(user.classSize ?? "");
  const [teachingStyle, setTeachingStyle] = useState(user.teachingStyle ?? "");
  const [childrenNote, setChildrenNote] = useState(user.childrenNote ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkCode, setLinkCode] = useState("");

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || undefined,
        targetAge: targetAge === "" ? null : targetAge,
        classSize: classSize === "" ? null : classSize,
        teachingStyle: teachingStyle || null,
        childrenNote: childrenNote || null,
        bio: bio || null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLineLink = async () => {
    setLinking(true);
    const res = await fetch("/api/line/link", { method: "POST" });
    const { code } = await res.json() as { code: string };
    setLinkCode(code);
    setLinking(false);
  };

  const handleLineUnlink = async () => {
    if (!confirm("LINE連携を解除しますか？")) return;
    await fetch("/api/line/link", { method: "DELETE" });
    window.location.reload();
  };

  return (
    <div className="space-y-5">
      {/* プロフィール基本情報 */}
      <div className="bg-white rounded-2xl border border-[#ece4d4] p-6 space-y-4">
        <h2 className="font-bold text-[#3d2b1f]">プロフィール</h2>

        <div>
          <label className="block text-sm font-medium text-[#5c3d2e] mb-1">メールアドレス</label>
          <input
            type="email"
            value={user.email ?? ""}
            disabled
            className="w-full border border-[#ece4d4] rounded-xl px-4 py-2.5 text-sm bg-[#faf8f3] text-[#b09070]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5c3d2e] mb-1">表示名</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-[#ddd0b8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4845a] text-[#3d2b1f]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5c3d2e] mb-1">自己紹介</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={2}
            className="w-full border border-[#ddd0b8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4845a] resize-none text-[#3d2b1f]"
          />
        </div>
      </div>

      {/* クラスプロファイル（週案生成に使われる） */}
      <div className="bg-white rounded-2xl border border-[#ece4d4] p-6 space-y-4">
        <div>
          <h2 className="font-bold text-[#3d2b1f]">クラス情報</h2>
          <p className="text-xs text-[#b09070] mt-0.5">
            週案をAIと作るときに自動で活用されます
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#5c3d2e] mb-1">担当クラスの年齢</label>
            <select
              value={targetAge}
              onChange={e => setTargetAge(e.target.value === "" ? "" : parseInt(e.target.value))}
              className="w-full border border-[#ddd0b8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4845a] text-[#3d2b1f] bg-white"
            >
              <option value="">未設定</option>
              {Object.entries(AGE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5c3d2e] mb-1">子どもの人数</label>
            <input
              type="number"
              value={classSize}
              onChange={e => setClassSize(e.target.value === "" ? "" : parseInt(e.target.value))}
              min={1}
              max={40}
              placeholder="例: 20"
              className="w-full border border-[#ddd0b8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4845a] text-[#3d2b1f]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5c3d2e] mb-1">
            保育スタイル・大切にしていること
          </label>
          <textarea
            value={teachingStyle}
            onChange={e => setTeachingStyle(e.target.value)}
            rows={3}
            placeholder="例：子どもの主体性を大切にした保育。遊びを通じた学びを重視しています。戸外活動を多く取り入れています。"
            className="w-full border border-[#ddd0b8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4845a] resize-none text-[#3d2b1f] placeholder-[#c4aa8a]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5c3d2e] mb-1">
            子どもたちの傾向・気になっていること
          </label>
          <textarea
            value={childrenNote}
            onChange={e => setChildrenNote(e.target.value)}
            rows={3}
            placeholder="例：活発な子が多く、体を動かす遊びが好き。言葉で気持ちを伝えるのが難しい子が数名いる。友だちへの関心が高まってきている。"
            className="w-full border border-[#ddd0b8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4845a] resize-none text-[#3d2b1f] placeholder-[#c4aa8a]"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#3d2b1f] text-[#f5f0e8] font-bold py-3 rounded-xl hover:bg-[#5c3d2e] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "保存中..." : saved ? "保存しました" : "保存する"}
        </button>
      </div>

      {/* LINE連携 */}
      <div className="bg-white rounded-2xl border border-[#ece4d4] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-[#3d2b1f]">LINE連携</h2>
            <p className="text-xs text-[#b09070] mt-0.5">LINEでメモを送るだけで週案の素材になります</p>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            lineLinked ? "bg-[#f0e8df] text-[#a85c38]" : "bg-[#faf8f3] text-[#b09070]"
          }`}>
            {lineLinked ? "連携済み" : "未連携"}
          </span>
        </div>

        {lineLinked ? (
          <button
            onClick={handleLineUnlink}
            className="w-full border border-red-200 text-red-500 text-sm py-2.5 rounded-xl hover:bg-red-50 cursor-pointer"
          >
            連携を解除する
          </button>
        ) : linkCode ? (
          <div className="bg-[#faf8f3] border border-[#ece4d4] rounded-xl p-4 text-center">
            <p className="text-sm text-[#5c3d2e] mb-2">LINE公式アカウントにこのコードを送信：</p>
            <p className="text-3xl font-bold text-[#a85c38] tracking-widest">{linkCode}</p>
            <p className="text-xs text-[#b09070] mt-2">有効期限：10分</p>
          </div>
        ) : (
          <button
            onClick={handleLineLink}
            disabled={linking}
            className="w-full bg-[#3d2b1f] text-[#f5f0e8] font-bold py-3 rounded-xl hover:bg-[#5c3d2e] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {linking ? "コードを発行中..." : "LINE連携コードを発行する"}
          </button>
        )}
      </div>
    </div>
  );
}
