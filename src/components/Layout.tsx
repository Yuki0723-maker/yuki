import type { ReactNode } from 'react';
import { BookOpen, Users, FileText, ClipboardList, Heart } from 'lucide-react';

type Page = 'dashboard' | 'children' | 'renrakucho' | 'shidokeikaku' | 'hoikunisshi';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: ReactNode;
}

const navItems = [
  { id: 'dashboard' as Page, label: 'ホーム', icon: Heart },
  { id: 'children' as Page, label: '園児管理', icon: Users },
  { id: 'renrakucho' as Page, label: '連絡帳', icon: BookOpen },
  { id: 'shidokeikaku' as Page, label: '指導計画', icon: ClipboardList },
  { id: 'hoikunisshi' as Page, label: '保育日誌', icon: FileText },
];

export function Layout({ currentPage, onNavigate, children }: Props) {
  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <header className="bg-green-600 text-white shadow-md no-print">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <h1 className="text-lg font-bold tracking-wide">保育士書類作成システム</h1>
        </div>
      </header>

      <div className="flex flex-1 max-w-5xl mx-auto w-full">
        <nav className="w-52 bg-white shadow-sm flex-shrink-0 no-print">
          <ul className="py-4 space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => onNavigate(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                    currentPage === id
                      ? 'bg-green-100 text-green-700 border-r-4 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
