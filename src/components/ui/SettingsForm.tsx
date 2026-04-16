"use client";

import { useState } from "react";
import { AGE_GROUP_LABELS } from "@/lib/utils";
import type { AgeGroup } from "@prisma/client";

const AGE_GROUP_OPTIONS = Object.entries(AGE_GROUP_LABELS) as [AgeGroup, string][];

const PREFECTURES = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県",
  "静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県",
  "奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県",
  "熊本県","大分県","宮崎県","鹿児島県","沖縄県",
];

interface UserData {
  id: string;
  displayName: string | null;
  name: string | null;
  email: string | null;
  prefecture: string | null;
  ageGroup: AgeGroup | null;
  bio: string | null;
  yearsExp: number | null;
}

export function SettingsForm({ user }: { user: UserData }) {
  const [form, setForm] = useState({
    displayName: user.displayName ?? user.name ?? "",
    prefecture: user.prefecture ?? "",
    ageGroup: user.ageGroup ?? "" as AgeGroup | "",
    bio: user.bio ?? "",
    yearsExp: user.yearsExp?.toString() ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.displayName || null,
        prefecture: form.prefecture || null,
        ageGroup: form.ageGroup || null,
        bio: form.bio || null,
        yearsExp: form.yearsExp ? parseInt(form.yearsExp) : null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          表示名（ニックネーム）
        </label>
        <input
          type="text"
          value={form.displayName}
          onChange={(e) => setForm(p => ({ ...p, displayName: e.target.value }))}
          placeholder="さくら先生"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <p className="text-xs text-gray-400 mt-1">フィードに表示される名前です</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">主な担当年齢</label>
          <select
            value={form.ageGroup}
            onChange={(e) => setForm(p => ({ ...p, ageGroup: e.target.value as AgeGroup | "" }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">未設定</option>
            {AGE_GROUP_OPTIONS.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">経験年数</label>
          <input
            type="number"
            min={0}
            max={50}
            value={form.yearsExp}
            onChange={(e) => setForm(p => ({ ...p, yearsExp: e.target.value }))}
            placeholder="5"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">都道府県</label>
        <select
          value={form.prefecture}
          onChange={(e) => setForm(p => ({ ...p, prefecture: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="">未設定</option>
          {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm(p => ({ ...p, bio: e.target.value }))}
          rows={3}
          placeholder="3歳児担当です。自然遊びが好きです。"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
        />
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs text-gray-500">
          📧 メールアドレス: <strong>{user.email}</strong>
          <br />
          メールアドレスの変更はサポートにお問い合わせください
        </p>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-green-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {saving ? "保存中..." : saved ? "✓ 保存しました" : "保存する"}
      </button>
    </form>
  );
}
