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
  };
  lineLinked: boolean;
}

export function ProfileForm({ user, lineLinked }: Props) {
  const [name, setName] = useState(user.name ?? "");
  const [targetAge, setTargetAge] = useState<number | "">(user.targetAge ?? "");
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
    <div className="space-y-6">
      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-gray-800">プロフィール</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
          <input
            type="email"
            value={user.email ?? ""}
            disabled
            className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">表示名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">担当クラスの年齢</label>
          <select
            value={targetAge}
            onChange={(e) => setTargetAge(e.target.value === "" ? "" : parseInt(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">未設定</option>
            {Object.entries(AGE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "保存中..." : saved ? "✓ 保存しました" : "保存する"}
        </button>
      </div>

      {/* LINE連携 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-800">LINE連携</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              LINEでメモを送るだけで週案の素材になります
            </p>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${lineLinked ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
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
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-700 mb-2">LINE公式アカウントにこのコードを送信：</p>
            <p className="text-3xl font-bold text-green-700 tracking-widest">{linkCode}</p>
            <p className="text-xs text-gray-400 mt-2">有効期限：10分</p>
          </div>
        ) : (
          <button
            onClick={handleLineLink}
            disabled={linking}
            className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {linking ? "コードを発行中..." : "LINE連携コードを発行する"}
          </button>
        )}
      </div>
    </div>
  );
}
