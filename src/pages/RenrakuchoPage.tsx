import { useState, useRef } from 'react';
import { Plus, Printer, Pencil, Trash2, BookOpen } from 'lucide-react';
import type { RenrakuchoEntry, AppData } from '../types';
import { Modal } from '../components/Modal';
import { InputField, TextareaField, SelectField } from '../components/FormField';
import { generateId, today, formatDate } from '../utils/storage';

interface Props {
  data: AppData;
  updateData: (updater: (prev: AppData) => AppData) => void;
}

const emptyEntry = (): Omit<RenrakuchoEntry, 'id' | 'createdAt'> => ({
  childId: '', date: today(), temperature: '', appetite: 'normal', sleep: '', condition: '', activities: '', parentMessage: '', teacherMessage: ''
});

const appetiteLabels = { good: 'よく食べた', normal: '普通', poor: '少なめ' };

export function RenrakuchoPage({ data, updateData }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState<RenrakuchoEntry | null>(null);
  const [form, setForm] = useState(emptyEntry());
  const [filterChildId, setFilterChildId] = useState('');
  const [printEntry, setPrintEntry] = useState<RenrakuchoEntry | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const openCreate = () => { setForm(emptyEntry()); setEditChild(null); setEditEntry(null); setShowModal(true); };
  const [, setEditChild] = useState<string | null>(null);
  const openEdit = (e: RenrakuchoEntry) => { setForm({ ...e }); setEditEntry(e); setShowModal(true); };

  const handleSave = () => {
    if (!form.childId || !form.date) return;
    if (editEntry) {
      updateData(prev => ({ ...prev, renrakucho: prev.renrakucho.map(r => r.id === editEntry.id ? { ...form, id: editEntry.id, createdAt: editEntry.createdAt } : r) }));
    } else {
      updateData(prev => ({ ...prev, renrakucho: [{ ...form, id: generateId(), createdAt: new Date().toISOString() }, ...prev.renrakucho] }));
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('この連絡帳を削除しますか？')) return;
    updateData(prev => ({ ...prev, renrakucho: prev.renrakucho.filter(r => r.id !== id) }));
  };

  const handlePrint = (entry: RenrakuchoEntry) => {
    setPrintEntry(entry);
    setTimeout(() => window.print(), 100);
  };

  const childMap = Object.fromEntries(data.children.map(c => [c.id, c]));
  const filtered = (filterChildId ? data.renrakucho.filter(r => r.childId === filterChildId) : data.renrakucho)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      {printEntry && (
        <div ref={printRef} className="hidden print:block p-8 font-sans">
          <h1 className="text-2xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-3">連 絡 帳</h1>
          <table className="w-full border-collapse text-sm mb-4">
            <tbody>
              <tr className="border border-gray-400">
                <td className="bg-gray-100 font-medium px-3 py-2 w-28">お名前</td>
                <td className="px-3 py-2">{childMap[printEntry.childId]?.name || ''}</td>
                <td className="bg-gray-100 font-medium px-3 py-2 w-20">日付</td>
                <td className="px-3 py-2">{formatDate(printEntry.date)}</td>
              </tr>
              <tr className="border border-gray-400">
                <td className="bg-gray-100 font-medium px-3 py-2">体温</td>
                <td className="px-3 py-2">{printEntry.temperature ? `${printEntry.temperature}℃` : '-'}</td>
                <td className="bg-gray-100 font-medium px-3 py-2">食欲</td>
                <td className="px-3 py-2">{appetiteLabels[printEntry.appetite]}</td>
              </tr>
              <tr className="border border-gray-400">
                <td className="bg-gray-100 font-medium px-3 py-2">睡眠</td>
                <td className="px-3 py-2" colSpan={3}>{printEntry.sleep || '-'}</td>
              </tr>
              <tr className="border border-gray-400">
                <td className="bg-gray-100 font-medium px-3 py-2">体調・様子</td>
                <td className="px-3 py-2" colSpan={3}>{printEntry.condition || '-'}</td>
              </tr>
              <tr className="border border-gray-400">
                <td className="bg-gray-100 font-medium px-3 py-2">活動内容</td>
                <td className="px-3 py-2" colSpan={3}>{printEntry.activities || '-'}</td>
              </tr>
            </tbody>
          </table>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-400 p-3 min-h-32">
              <div className="font-medium text-sm mb-2 border-b border-gray-200 pb-1">保護者からのメッセージ</div>
              <p className="text-sm whitespace-pre-wrap">{printEntry.parentMessage}</p>
            </div>
            <div className="border border-gray-400 p-3 min-h-32">
              <div className="font-medium text-sm mb-2 border-b border-gray-200 pb-1">保育士からのメッセージ</div>
              <p className="text-sm whitespace-pre-wrap">{printEntry.teacherMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between no-print">
        <h2 className="text-xl font-bold text-gray-800">連絡帳</h2>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer">
          <Plus size={16} /> 新規作成
        </button>
      </div>

      <div className="no-print">
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={filterChildId} onChange={e => setFilterChildId(e.target.value)}>
          <option value="">全園児</option>
          {data.children.map(c => <option key={c.id} value={c.id}>{c.name} ({c.group})</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-dashed border-gray-200 no-print">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>連絡帳がありません</p>
        </div>
      ) : (
        <div className="space-y-3 no-print">
          {filtered.map(entry => {
            const child = childMap[entry.childId];
            return (
              <div key={entry.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-800">{child?.name || '不明'}</span>
                      <span className="text-sm text-gray-400">{child?.group}</span>
                      <span className="text-sm text-gray-500">{formatDate(entry.date)}</span>
                    </div>
                    <div className="flex gap-3 text-sm text-gray-600 flex-wrap">
                      {entry.temperature && <span>🌡️ {entry.temperature}℃</span>}
                      <span>🍽️ {appetiteLabels[entry.appetite]}</span>
                      {entry.condition && <span className="text-gray-500 truncate max-w-48">{entry.condition}</span>}
                    </div>
                    {entry.teacherMessage && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{entry.teacherMessage}</p>}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => handlePrint(entry)} title="印刷" className="p-2 text-gray-400 hover:text-blue-500 cursor-pointer"><Printer size={15} /></button>
                    <button onClick={() => openEdit(entry)} className="p-2 text-gray-400 hover:text-green-500 cursor-pointer"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(entry.id)} className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editEntry ? '連絡帳を編集' : '連絡帳を作成'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="園児" required
                value={form.childId}
                onChange={e => setForm(p => ({ ...p, childId: e.target.value }))}
                options={[{ value: '', label: '選択してください' }, ...data.children.map(c => ({ value: c.id, label: `${c.name} (${c.group})` }))]}
              />
              <InputField label="日付" required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <InputField label="体温 (℃)" type="number" step="0.1" value={form.temperature} onChange={e => setForm(p => ({ ...p, temperature: e.target.value }))} placeholder="36.5" />
              <SelectField
                label="食欲"
                value={form.appetite}
                onChange={e => setForm(p => ({ ...p, appetite: e.target.value as 'good' | 'normal' | 'poor' }))}
                options={[{ value: 'good', label: 'よく食べた' }, { value: 'normal', label: '普通' }, { value: 'poor', label: '少なめ' }]}
              />
              <InputField label="睡眠" value={form.sleep} onChange={e => setForm(p => ({ ...p, sleep: e.target.value }))} placeholder="昼寝 13:00-15:00" />
            </div>
            <TextareaField label="体調・様子" value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))} rows={2} />
            <TextareaField label="活動内容" value={form.activities} onChange={e => setForm(p => ({ ...p, activities: e.target.value }))} rows={2} />
            <TextareaField label="保護者からのメッセージ" value={form.parentMessage} onChange={e => setForm(p => ({ ...p, parentMessage: e.target.value }))} rows={3} />
            <TextareaField label="保育士からのメッセージ" value={form.teacherMessage} onChange={e => setForm(p => ({ ...p, teacherMessage: e.target.value }))} rows={3} />
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 cursor-pointer">キャンセル</button>
              <button onClick={handleSave} className="px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium cursor-pointer">保存</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
