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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif-jp text-lg font-bold" style={{ color: "#4A4A4A", letterSpacing: "0.04em" }}>
          おかえりなさい
        </h2>
        <p
          className="text-xs mt-2 rounded-2xl px-3 py-2"
          style={{ color: "#9A8878", background: "rgba(209,232,226,0.3)", border: "1px solid rgba(178,226,242,0.4)" }}
        >
          開発モード：任意のメールアドレスでログインできます
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#9A8878", letterSpacing: "0.06em" }}>
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-kotonoha w-full text-sm"
            style={{ color: "#4A4A4A" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#9A8878", letterSpacing: "0.06em" }}>
            お名前
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-kotonoha w-full text-sm"
            style={{ color: "#4A4A4A" }}
          />
        </div>

        {error && (
          <p className="text-sm" style={{ color: "#E07070" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-sm font-medium rounded-2xl py-3.5 transition-all disabled:opacity-50 cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #FFB7B2 0%, #ffcac6 100%)",
            color: "#4A4A4A",
            boxShadow: "0 4px 16px rgba(255,183,178,0.4)",
            minHeight: "52px",
          }}
        >
          {loading ? "ログイン中..." : "ログインする"}
        </button>
      </form>
    </div>
  );
}
