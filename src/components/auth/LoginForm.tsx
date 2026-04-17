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
        <h2 className="text-lg font-bold text-[#3d2b1f]">おかえりなさい</h2>
        <p className="text-xs text-[#b09070] mt-1 bg-[#faf8f3] border border-[#ece4d4] rounded-lg px-3 py-2">
          開発モード：任意のメールアドレスでログインできます
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#5c3d2e] mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-[#ddd0b8] rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#d4845a] bg-[#faf8f3] text-[#3d2b1f]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#5c3d2e] mb-1">
            お名前
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#ddd0b8] rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#d4845a] bg-[#faf8f3] text-[#3d2b1f]"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3d2b1f] text-[#f5f0e8] rounded-xl py-3.5 text-base font-bold hover:bg-[#5c3d2e] transition-colors disabled:opacity-50 cursor-pointer"
          style={{ minHeight: "52px" }}
        >
          {loading ? "ログイン中..." : "ログインする"}
        </button>
      </form>
    </div>
  );
}
