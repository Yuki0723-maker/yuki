"use client";

import React from "react";
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
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { href: "/plans",          label: "ホーム",         icon: "home" },
  { href: "/weekly-plan/new", label: "週案を作る",     icon: "pen", primary: true },
  { href: "/community",      label: "コミュニティ",   icon: "leaf" },
  { href: "/settings/format", label: "フォーマット設定", icon: "file" },
  { href: "/profile",        label: "マイページ",     icon: "user" },
];

const icons: Record<string, React.ReactElement> = {
  home: (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
      <path d="M2 7L8 2L14 7V14H10V10H6V14H2V7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  pen: (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
      <path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  leaf: (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
      <path d="M13 2C13 2 12 9 7 11C4 12 2 14 2 14C2 14 3 8 6 6C9 4 13 2 13 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M2 14L6 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  file: (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
      <path d="M3 2H10L13 5V14H3V2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M10 2V5H13" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5" y1="11" x2="9" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M2 14C2 11 4.5 9 8 9C11.5 9 14 11 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  ),
};

export function Sidebar({ user, collapsed, onToggle }: Props) {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-20 transition-[width] duration-200"
      style={{
        width: collapsed ? 72 : 256,
        background: "rgba(255, 255, 255, 0.82)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.9)",
        boxShadow: "2px 0 20px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center h-16 px-4 gap-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,183,178,0.2)" }}>
        {!collapsed && (
          <Link href="/plans" className="flex items-center gap-2 flex-1 min-w-0">
            <LeafLogo />
            <span className="font-serif-jp text-base font-bold tracking-widest truncate" style={{ color: "#4A4A4A", letterSpacing: "0.12em" }}>
              ことのは
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/plans" className="flex items-center justify-center w-full">
            <LeafLogo />
          </Link>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer"
            style={{ color: "#C4A898" }}
            title="サイドバーを閉じる"
          >
            <PanelCloseIcon />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {collapsed && (
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center h-10 rounded-xl transition-colors cursor-pointer mb-3"
            style={{ color: "#C4A898" }}
            title="サイドバーを開く"
          >
            <PanelOpenIcon />
          </button>
        )}

        {navItems.map(({ href, label, icon, primary }) => {
          const isActive = !primary && (
            pathname === href ||
            (href !== "/plans" && pathname.startsWith(href))
          );

          if (primary) {
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className="flex items-center rounded-2xl text-sm font-medium transition-all"
                style={{
                  background: "linear-gradient(135deg, #FFB7B2 0%, #ffcac6 100%)",
                  color: "#4A4A4A",
                  minHeight: 44,
                  justifyContent: collapsed ? "center" : undefined,
                  gap: collapsed ? 0 : 10,
                  padding: collapsed ? "0" : "10px 14px",
                  boxShadow: "0 2px 12px rgba(255,183,178,0.35)",
                }}
              >
                <span className="flex-shrink-0">{icons[icon]}</span>
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className="flex items-center rounded-2xl text-sm font-medium transition-all"
              style={{
                minHeight: 44,
                justifyContent: collapsed ? "center" : undefined,
                gap: collapsed ? 0 : 10,
                padding: collapsed ? "0" : "10px 14px",
                background: isActive ? "rgba(255,183,178,0.18)" : "transparent",
                color: isActive ? "#4A4A4A" : "#A08878",
                borderLeft: isActive && !collapsed ? "2px solid #FFB7B2" : "2px solid transparent",
              }}
            >
              <span className="flex-shrink-0">{icons[icon]}</span>
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User area */}
      <div
        className={`flex-shrink-0 ${collapsed ? "p-3" : "px-4 py-4"}`}
        style={{ borderTop: "1px solid rgba(255,183,178,0.2)" }}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: "rgba(255,183,178,0.25)", color: "#A08878" }}
            >
              {(user.name ?? user.email ?? "?")[0].toUpperCase()}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="transition-colors cursor-pointer"
              style={{ color: "#C4A898" }}
              title="ログアウト"
            >
              <LogoutIcon />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: "rgba(255,183,178,0.25)", color: "#A08878" }}
              >
                {(user.name ?? user.email ?? "?")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#4A4A4A" }}>
                  {user.name ?? "保育士さん"}
                </p>
                <p className="text-xs truncate" style={{ color: "#B0A098" }}>{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-xs py-1 cursor-pointer transition-colors text-left"
              style={{ color: "#C4A898" }}
            >
              ログアウト
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

function LeafLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <path
        d="M12 3 C12 3 5 8 5 14 C5 18 8.1 21 12 21 C15.9 21 19 18 19 14 C19 8 12 3 12 3Z"
        fill="#D1E8E2" stroke="#B8D8CE" strokeWidth="1" opacity="0.9"
      />
      <path d="M12 6 L12 19" stroke="#9EC8BC" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
      <path d="M12 11 L15.5 9" stroke="#9EC8BC" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
      <path d="M12 14 L15.5 12" stroke="#9EC8BC" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
      <path d="M12 11 L8.5 9" stroke="#9EC8BC" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

function PanelCloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <line x1="7" y1="2" x2="7" y2="16" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M10 7L12 9L10 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PanelOpenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <line x1="7" y1="2" x2="7" y2="16" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M14 7L12 9L14 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2H3C2.4 2 2 2.4 2 3V13C2 13.6 2.4 14 3 14H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M10 5L13 8L10 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="13" y1="8" x2="6" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
