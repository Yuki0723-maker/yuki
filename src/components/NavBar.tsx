'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const TABS = [
  { href: '/candidates', label: '候補者' },
  { href: '/organizations', label: '園' },
  { href: '/placements', label: '選考' },
  { href: '/settings', label: '設定' },
];

export default function NavBar({ email }: { email: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/placements" className="py-4 text-base font-bold text-slate-900">
            ホイクペディア管理
          </Link>
          <nav className="flex gap-1">
            {TABS.map((tab) => {
              const active =
                pathname === tab.href || pathname.startsWith(tab.href + '/');
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`border-b-2 px-3 py-4 text-sm font-medium transition-colors ${
                    active
                      ? 'border-brand-600 text-brand-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden text-sm text-slate-500 sm:inline">{email}</span>
          )}
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
