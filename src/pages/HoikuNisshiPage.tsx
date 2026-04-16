import { useState } from 'react';
import { Plus, Pencil, Trash2, Printer, FileText } from 'lucide-react';
import type { HoikuNisshi, AppData } from '../types';
import { Modal } from '../components/Modal';
import { InputField, TextareaField, SelectField } from '../components/FormField';
import { generateId, today, formatDate } from '../utils/storage';

interface Props {
  data: AppData;
  updateData: (updater: (prev: AppData) => AppData) => void;
}

const emptyNisshi = (): Omit<HoikuNisshi, 'id' | 'createdAt'> => ({
  date: today(), group: '', teacherName: '', attendance: 0, weather: '', activities: '', childrenCondition: '', reflections: '', nextPlan: ''
});

const groups = ['0歳児', '1歳児', '2歳児', '3歳児', '4歳児', '5歳児'];
const weatherOptions = ['晴れ', '曇り', '雨', '雪', '晴れ/曇り', '曇り/雨'];

export function HoikuNisshiPage({ data, updateData }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editNisshi, setEditNisshi] = useState<HoikuNisshi | null>(null);
  const [form, setForm] = useState(emptyNisshi());
  const [printNisshi, setPrintNisshi] = useState<HoikuNisshi | null>(null);

  const openCreate = () => { setForm(emptyNisshi()); setEditNisshi(null); setShowModal(true); };
  const openEdit = (n: HoikuNisshi) => { setForm({ ...n }); setEditNisshi(n); setShowModal(true); };

  const handleSave = () => {
    if (!form.date || !form.group) return;
    if (editNisshi) {
      updateData(prev => ({ ...prev, hoikuNisshi: prev.hoikuNisshi.map(n => n.id === editNisshi.id ? { ...form, id: editNisshi.id, createdAt: editNisshi.createdAt } : n) }));
    } else {
      updateData(prev => ({ ...prev, hoikuNisshi: [{ ...form, id: generateId(), createdAt: new Date().toISOString() }, ...prev.hoikuNisshi] }));
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('この保育日誌を削除しますか？')) return;
    updateData(prev => ({ ...prev, hoikuNisshi: prev.hoikuNisshi.filter(n => n.id !== id) }));
  };

  const handlePrint = (nisshi: HoikuNisshi) => {
    setPrintNisshi(nisshi);
    setTimeout(() => window.print(), 100);
  };

  const sorted = [...data.hoikuNisshi].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      {printNisshi && (
        <div className="hidden print:block p-8 font-sans">
          <h1 className="text-2xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-3">保 育 日 誌</h1>
          <table className="w-full border-collapse text-sm mb-4">
            <tbody>
              <tr className="border border-gray-400">
                <td className="bg-gray-100 font-medium px-3 py-2 w-24">日付</td>
                <td className="px-3 py-2">{formatDate(printNisshi.date)}</td>
                <td className="bg-gray-100 font-medium px-3 py-2 w-20">クラス</td>
                <td className="px-3 py-2">{printNisshi.group}</td>
                <td className="bg-gray-100 font-medium px-3 py-2 w-20">担任</td>
                <td className="px-3 py-2">{printNisshi.teacherName}</td>
              </tr>
              <tr className="border border-gray-400">
                <td className="bg-gray-100 font-medium px-3 py-2">天気</td>
                <td className="px-3 py-2">{printNisshi.weather}</td>
                <td className="bg-gray-100 font-medium px-3 py-2">出席人数</td>
                <td className="px-3 py-2" colSpan={3}>{printNisshi.attendance}名</td>
              </tr>
            </tbody>
          </table>
          {[
            { label: '活動内容', value: printNisshi.activities },
            { label: '子どもたちの様子', value: printNisshi.childrenCondition },
            { label: '反省・考察', value: printNisshi.reflections },
            { label: '次回の計画', value: printNisshi.nextPlan },
          ].map(({ label, value }) => (
            <div key={label} className="mb-4 border border-gray-400">
              <div className="bg-gray-100 font-medium px-3 py-2 text-sm border-b border-gray-400">{label}</div>
              <div className="px-3 py-3 min-h-20 text-sm whitespace-pre-wrap">{value}</div>
            </div>
          ))}
          <div className="mt-8 flex justify-end gap-12 text-sm">
            <div>担任署名: ___________</div>
            <div>主任確認: ___________</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between no-print">
        <h2 className="text-xl font-bold text-gray-800">保育日誌</h2>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer">
          <Plus size={16} /> 新規作成
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-dashed border-gray-200 no-print">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>保育日誌がありません</p>
        </div>
      ) : (
        <div className="space-y-3 no-print">
          {sorted.map(nisshi => (
            <div key={nisshi.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-bold text-gray-800">{formatDate(nisshi.date)}</span>
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{nisshi.group}</span>
                    {nisshi.weather && <span className="text-sm text-gray-500">{nisshi.weather}</span>}
                    {nisshi.attendance > 0 && <span className="text-sm text-gray-500">出席 {nisshi.attendance}名</span>}
                    {nisshi.teacherName && <span className="text-sm text-gray-500">担任: {nisshi.teacherName}</span>}
                  </div>
                  {nisshi.activities && <p className="text-sm text-gray-600 line-clamp-2">{nisshi.activities}</p>}
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => handlePrint(nisshi)} className="p-2 text-gray-400 hover:text-blue-500 cursor-pointer"><Printer size={15} /></button>
                  <button onClick={() => openEdit(nisshi)} className="p-2 text-gray-400 hover:text-green-500 cursor-pointer"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(nisshi.id)} className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editNisshi ? '保育日誌を編集' : '保育日誌を作成'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="日付" required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              <SelectField
                label="クラス" required
                value={form.group}
                onChange={e => setForm(p => ({ ...p, group: e.target.value }))}
                options={[{ value: '', label: '選択してください' }, ...groups.map(g => ({ value: g, label: g }))]}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <InputField label="担任名" value={form.teacherName} onChange={e => setForm(p => ({ ...p, teacherName: e.target.value }))} />
              <InputField label="出席人数" type="number" min={0} value={form.attendance || ''} onChange={e => setForm(p => ({ ...p, attendance: Number(e.target.value) }))} />
              <SelectField
                label="天気"
                value={form.weather}
                onChange={e => setForm(p => ({ ...p, weather: e.target.value }))}
                options={[{ value: '', label: '選択してください' }, ...weatherOptions.map(w => ({ value: w, label: w }))]}
              />
            </div>
            <TextareaField label="活動内容" required value={form.activities} onChange={e => setForm(p => ({ ...p, activities: e.target.value }))} rows={4} />
            <TextareaField label="子どもたちの様子" value={form.childrenCondition} onChange={e => setForm(p => ({ ...p, childrenCondition: e.target.value }))} rows={3} />
            <TextareaField label="反省・考察" value={form.reflections} onChange={e => setForm(p => ({ ...p, reflections: e.target.value }))} rows={3} />
            <TextareaField label="次回の計画" value={form.nextPlan} onChange={e => setForm(p => ({ ...p, nextPlan: e.target.value }))} rows={2} />
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
