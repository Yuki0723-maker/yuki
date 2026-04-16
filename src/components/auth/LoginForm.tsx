"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@hoikunote.app");
  const [name, setName] = useState("田中先生");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      name,
      redirect: false,
    });

    if (res?.error) {
      setError("ログインに失敗しました");
      setLoading(false);
    } else {
      router.push("/plans");
      router.refresh();
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900">ログイン</h2>
        <p className="text-xs text-gray-400 mt-1 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
          🔧 開発モード：任意のメールアドレスで即ログインできます
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            名前
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white rounded-xl py-3.5 text-base font-bold hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
          style={{ minHeight: "52px" }}
        >
          {loading ? "ログイン中..." : "ログインする"}
        </button>
      </form>
    </div>
  );
}
