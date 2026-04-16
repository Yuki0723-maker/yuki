import { useState } from 'react';
import { Plus, Pencil, Trash2, Printer, ClipboardList } from 'lucide-react';
import type { ShidoKeikaku, AppData } from '../types';
import { Modal } from '../components/Modal';
import { TextareaField, SelectField, InputField } from '../components/FormField';
import { generateId } from '../utils/storage';

interface Props {
  data: AppData;
  updateData: (updater: (prev: AppData) => AppData) => void;
}

const emptyPlan = (): Omit<ShidoKeikaku, 'id' | 'createdAt'> => ({
  type: 'monthly', group: '', period: '', goals: '', activities: '', environment: '', evaluation: ''
});

const typeLabels = { monthly: '月案', weekly: '週案', daily: '日案' };
const groups = ['0歳児', '1歳児', '2歳児', '3歳児', '4歳児', '5歳児'];

export function ShidoKeikakuPage({ data, updateData }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState<ShidoKeikaku | null>(null);
  const [form, setForm] = useState(emptyPlan());
  const [filterType, setFilterType] = useState<string>('');
  const [printPlan, setPrintPlan] = useState<ShidoKeikaku | null>(null);

  const openCreate = () => { setForm(emptyPlan()); setEditPlan(null); setShowModal(true); };
  const openEdit = (p: ShidoKeikaku) => { setForm({ ...p }); setEditPlan(p); setShowModal(true); };

  const handleSave = () => {
    if (!form.group || !form.period) return;
    if (editPlan) {
      updateData(prev => ({ ...prev, shidoKeikaku: prev.shidoKeikaku.map(p => p.id === editPlan.id ? { ...form, id: editPlan.id, createdAt: editPlan.createdAt } : p) }));
    } else {
      updateData(prev => ({ ...prev, shidoKeikaku: [{ ...form, id: generateId(), createdAt: new Date().toISOString() }, ...prev.shidoKeikaku] }));
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('この指導計画を削除しますか？')) return;
    updateData(prev => ({ ...prev, shidoKeikaku: prev.shidoKeikaku.filter(p => p.id !== id) }));
  };

  const handlePrint = (plan: ShidoKeikaku) => {
    setPrintPlan(plan);
    setTimeout(() => window.print(), 100);
  };

  const filtered = filterType ? data.shidoKeikaku.filter(p => p.type === filterType) : data.shidoKeikaku;

  return (
    <div className="space-y-4">
      {printPlan && (
        <div className="hidden print:block p-8 font-sans">
          <h1 className="text-2xl font-bold text-center mb-2">{typeLabels[printPlan.type]}</h1>
          <p className="text-center text-gray-600 mb-6">{printPlan.group} ／ {printPlan.period}</p>
          {[
            { label: '保育のねらい・目標', value: printPlan.goals },
            { label: '活動内容', value: printPlan.activities },
            { label: '環境構成', value: printPlan.environment },
            { label: '評価・反省', value: printPlan.evaluation },
          ].map(({ label, value }) => (
            <div key={label} className="mb-4 border border-gray-400">
              <div className="bg-gray-100 font-medium px-3 py-2 text-sm border-b border-gray-400">{label}</div>
              <div className="px-3 py-3 min-h-20 text-sm whitespace-pre-wrap">{value}</div>
            </div>
          ))}
          <div className="mt-8 flex justify-end gap-12 text-sm">
            <div>担任署名: ___________</div>
            <div>主任確認: ___________</div>
            <div>園長確認: ___________</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between no-print">
        <h2 className="text-xl font-bold text-gray-800">指導計画</h2>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer">
          <Plus size={16} /> 新規作成
        </button>
      </div>

      <div className="flex gap-2 no-print">
        {['', 'monthly', 'weekly', 'daily'].map(t => (
          <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${filterType === t ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>
            {t === '' ? '全て' : typeLabels[t as keyof typeof typeLabels]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-dashed border-gray-200 no-print">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
          <p>指導計画がありません</p>
        </div>
      ) : (
        <div className="space-y-3 no-print">
          {filtered.map(plan => (
            <div key={plan.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${plan.type === 'monthly' ? 'bg-purple-100 text-purple-700' : plan.type === 'weekly' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {typeLabels[plan.type]}
                    </span>
                    <span className="font-bold text-gray-800">{plan.group}</span>
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  </div>
                  {plan.goals && <p className="text-sm text-gray-600 line-clamp-2">{plan.goals}</p>}
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => handlePrint(plan)} className="p-2 text-gray-400 hover:text-blue-500 cursor-pointer"><Printer size={15} /></button>
                  <button onClick={() => openEdit(plan)} className="p-2 text-gray-400 hover:text-green-500 cursor-pointer"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(plan.id)} className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editPlan ? '指導計画を編集' : '指導計画を作成'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <SelectField
                label="種別" required
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as 'monthly' | 'weekly' | 'daily' }))}
                options={[{ value: 'monthly', label: '月案' }, { value: 'weekly', label: '週案' }, { value: 'daily', label: '日案' }]}
              />
              <SelectField
                label="クラス" required
                value={form.group}
                onChange={e => setForm(p => ({ ...p, group: e.target.value }))}
                options={[{ value: '', label: '選択してください' }, ...groups.map(g => ({ value: g, label: g }))]}
              />
              <InputField label="期間" required value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} placeholder="2024年4月" />
            </div>
            <TextareaField label="保育のねらい・目標" required value={form.goals} onChange={e => setForm(p => ({ ...p, goals: e.target.value }))} rows={3} />
            <TextareaField label="活動内容" value={form.activities} onChange={e => setForm(p => ({ ...p, activities: e.target.value }))} rows={4} />
            <TextareaField label="環境構成" value={form.environment} onChange={e => setForm(p => ({ ...p, environment: e.target.value }))} rows={3} />
            <TextareaField label="評価・反省" value={form.evaluation} onChange={e => setForm(p => ({ ...p, evaluation: e.target.value }))} rows={3} />
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
