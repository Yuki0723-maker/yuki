import { BookOpen, Users, FileText, ClipboardList, TrendingUp } from 'lucide-react';
import type { AppData } from '../types';

interface Props {
  data: AppData;
  onNavigate: (page: 'children' | 'renrakucho' | 'shidokeikaku' | 'hoikunisshi') => void;
}

export function Dashboard({ data, onNavigate }: Props) {
  const stats = [
    { label: '登録園児数', value: data.children.length, unit: '名', color: 'bg-blue-100 text-blue-700', icon: Users },
    { label: '連絡帳', value: data.renrakucho.length, unit: '件', color: 'bg-green-100 text-green-700', icon: BookOpen },
    { label: '指導計画', value: data.shidoKeikaku.length, unit: '件', color: 'bg-purple-100 text-purple-700', icon: ClipboardList },
    { label: '保育日誌', value: data.hoikuNisshi.length, unit: '件', color: 'bg-orange-100 text-orange-700', icon: FileText },
  ];

  const shortcuts = [
    { label: '園児を登録する', page: 'children' as const, icon: Users, desc: '園児の基本情報を管理' },
    { label: '連絡帳を作成する', page: 'renrakucho' as const, icon: BookOpen, desc: '保護者への連絡・報告' },
    { label: '指導計画を作成する', page: 'shidokeikaku' as const, icon: ClipboardList, desc: '月案・週案・日案の作成' },
    { label: '保育日誌を記録する', page: 'hoikunisshi' as const, icon: FileText, desc: '日々の保育記録' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">ダッシュボード</h2>
        <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, unit, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${color} mb-3`}>
              <Icon size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-800">{value}<span className="text-base font-normal text-gray-500 ml-1">{unit}</span></div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-green-600" />
          <h3 className="font-bold text-gray-700">クイックアクション</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shortcuts.map(({ label, page, icon: Icon, desc }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:border-green-300 hover:shadow-md transition-all text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">{label}</div>
                <div className="text-sm text-gray-400">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
