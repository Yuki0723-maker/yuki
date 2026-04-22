"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";

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

  return (
    <div className="flex min-h-screen bg-[#faf8f3]">
      <Sidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main
        className="flex-1 transition-[margin] duration-200 min-h-screen"
        style={{ marginLeft: collapsed ? 64 : 224 }}
      >
        {children}
      </main>
    </div>
  );
}
