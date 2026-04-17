"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface Props {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    targetAge?: number | null;
  };
}

const navItems = [
  { href: "/plans", label: "ホーム", icon: "🏠" },
  { href: "/plan/new", label: "週案を作る", icon: "✍️", primary: true },
  { href: "/community", label: "コミュニティ", icon: "🌸" },
  { href: "/settings/templates", label: "フォーマット", icon: "📄" },
  { href: "/profile", label: "マイページ", icon: "👤" },
];

export function Sidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 w-56 h-screen bg-white border-r border-pink-100 flex flex-col z-10">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-pink-50">
        <Link href="/plans" className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <span className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            HoikuNote
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon, primary }) => {
          const isActive = pathname === href || (href !== "/plan/new" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all ${
                primary
                  ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:from-pink-500 hover:to-purple-500 shadow-md shadow-pink-100"
                  : isActive
                  ? "bg-pink-50 text-pink-600"
                  : "text-gray-500 hover:bg-pink-50 hover:text-pink-500"
              }`}
              style={{ minHeight: "48px" }}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-pink-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center text-pink-600 font-bold text-sm flex-shrink-0">
            {(user.name ?? user.email ?? "?")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {user.name ?? "保育士さん"}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-xs text-gray-400 hover:text-pink-400 py-1 cursor-pointer transition-colors"
        >
          ログアウト
        </button>
      </div>
    </aside>
  );
}
