import Link from "next/link";

export const metadata = { title: "X 運用サポート" };

export default function XOpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-56 h-screen bg-white border-r border-gray-100 flex flex-col z-10">
        <div className="px-5 py-5 border-b border-gray-50">
          <Link href="/x-ops" className="flex items-center gap-2">
            <span className="text-xl font-bold text-black">𝕏</span>
            <span className="text-base font-bold text-gray-900">運用サポート</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/x-ops"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <span>🏠</span>ダッシュボード
          </Link>
          <Link
            href="/x-ops/ideas/new"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <span>✏️</span>アイデアを追加
          </Link>
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">Powered by Claude API</p>
        </div>
      </aside>

      <main className="flex-1 ml-56 p-8 max-w-4xl">{children}</main>
    </div>
  );
}
