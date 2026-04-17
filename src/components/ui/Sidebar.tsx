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
  { href: "/plans", label: "ホーム", icon: "home" },
  { href: "/plan/new", label: "週案を作る", icon: "pen", primary: true },
  { href: "/community", label: "コミュニティ", icon: "leaf" },
  { href: "/settings/templates", label: "フォーマット", icon: "file" },
  { href: "/profile", label: "マイページ", icon: "user" },
];

const icons: Record<string, JSX.Element> = {
  home: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 7L8 2L14 7V14H10V10H6V14H2V7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  pen: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  leaf: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13 2C13 2 12 9 7 11C4 12 2 14 2 14C2 14 3 8 6 6C9 4 13 2 13 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M2 14L6 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  file: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 2H10L13 5V14H3V2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M10 2V5H13" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="5" y1="11" x2="9" y2="11" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M2 14C2 11 4.5 9 8 9C11.5 9 14 11 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  ),
};

export function Sidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 w-56 h-screen bg-white border-r border-[#ece4d4] flex flex-col z-10">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#f0e8d8]">
        <Link href="/plans" className="flex items-center gap-2.5">
          <CupLogo />
          <span className="text-base font-bold text-[#3d2b1f] tracking-wide">HoikuNote</span>
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
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                primary
                  ? "bg-[#3d2b1f] text-[#f5f0e8] hover:bg-[#5c3d2e]"
                  : isActive
                  ? "bg-[#f5f0e8] text-[#a85c38]"
                  : "text-[#8a6a50] hover:bg-[#faf8f3] hover:text-[#3d2b1f]"
              }`}
              style={{ minHeight: "44px" }}
            >
              <span className="flex-shrink-0">{icons[icon]}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-[#f0e8d8]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#ece4d4] flex items-center justify-center text-[#a85c38] font-bold text-sm flex-shrink-0">
            {(user.name ?? user.email ?? "?")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#3d2b1f] truncate">
              {user.name ?? "保育士さん"}
            </p>
            <p className="text-xs text-[#b09070] truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-xs text-[#b09070] hover:text-[#3d2b1f] py-1 cursor-pointer transition-colors"
        >
          ログアウト
        </button>
      </div>
    </aside>
  );
}

function CupLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 9 Q4 18 11 18 Q18 18 18 9 Z" stroke="#3d2b1f" strokeWidth="1.6" fill="none"/>
      <rect x="3.5" y="6" width="15" height="4" rx="2" stroke="#3d2b1f" strokeWidth="1.6" fill="none"/>
      <path d="M18 10 Q22 10 22 13 Q22 16 18 16" stroke="#3d2b1f" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M8 3.5 Q7.5 2 8 0.5" stroke="#d4845a" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M11 3 Q10.5 1.5 11 0" stroke="#d4845a" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M14 3.5 Q13.5 2 14 0.5" stroke="#d4845a" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
