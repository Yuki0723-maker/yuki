'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
        setLoading(false);
        return;
      }
      router.push('/placements');
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setMessage(
        '登録メールを送信しました。確認後にログインしてください。（メール確認が無効の場合はそのままログインできます）'
      );
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          メールアドレス
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          パスワード
        </label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading
          ? '処理中…'
          : mode === 'signin'
            ? 'ログイン'
            : 'アカウント作成'}
      </button>

      <p className="text-center text-sm text-slate-500">
        {mode === 'signin' ? (
          <>
            アカウントがない場合は{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
                setMessage(null);
              }}
              className="font-medium text-brand-600 hover:underline"
            >
              新規作成
            </button>
          </>
        ) : (
          <>
            既にアカウントがある場合は{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
                setMessage(null);
              }}
              className="font-medium text-brand-600 hover:underline"
            >
              ログイン
            </button>
          </>
        )}
      </p>
    </form>
  );
}
