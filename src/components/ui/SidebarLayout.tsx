"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./Sidebar";

interface Props {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    targetAge?: number | null;
  };
  children: React.ReactNode;
}

export function SidebarLayout({ user, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="flex min-h-screen" style={{ background: "#FDF5E6" }}>
      {/* デスクトップ用サイドバー */}
      {!isMobile && (
        <Sidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      )}

      <main
        className="flex-1 min-h-screen transition-[margin] duration-200"
        style={{
          marginLeft: isMobile ? 0 : (collapsed ? 72 : 256),
          paddingBottom: isMobile ? 72 : 0,
        }}
      >
        {children}
      </main>

      {/* モバイル用ボトムナビ */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}
