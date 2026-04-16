import { useState } from 'react';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import type { Child, AppData } from '../types';
import { Modal } from '../components/Modal';
import { InputField, TextareaField } from '../components/FormField';
import { generateId } from '../utils/storage';

interface Props {
  data: AppData;
  updateData: (updater: (prev: AppData) => AppData) => void;
}

const emptyChild = (): Omit<Child, 'id'> => ({
  name: '', kana: '', birthDate: '', group: '', parentName: '', parentContact: '', notes: ''
});

const groups = ['0歳児', '1歳児', '2歳児', '3歳児', '4歳児', '5歳児'];

export function ChildrenPage({ data, updateData }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editChild, setEditChild] = useState<Child | null>(null);
  const [form, setForm] = useState(emptyChild());
  const [filterGroup, setFilterGroup] = useState('');

  const openCreate = () => { setForm(emptyChild()); setEditChild(null); setShowModal(true); };
  const openEdit = (c: Child) => { setForm({ ...c }); setEditChild(c); setShowModal(true); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editChild) {
      updateData(prev => ({ ...prev, children: prev.children.map(c => c.id === editChild.id ? { ...form, id: editChild.id } : c) }));
    } else {
      updateData(prev => ({ ...prev, children: [...prev.children, { ...form, id: generateId() }] }));
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('この園児を削除しますか？関連する書類は残ります。')) return;
    updateData(prev => ({ ...prev, children: prev.children.filter(c => c.id !== id) }));
  };

  const filtered = filterGroup ? data.children.filter(c => c.group === filterGroup) : data.children;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">園児管理</h2>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer">
          <Plus size={16} /> 園児を登録
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterGroup('')} className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${!filterGroup ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>全て</button>
        {groups.map(g => (
          <button key={g} onClick={() => setFilterGroup(g)} className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${filterGroup === g ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>{g}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-dashed border-gray-200">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p>園児が登録されていません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(child => (
            <div key={child.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-gray-800">{child.name}</div>
                  <div className="text-sm text-gray-400">{child.kana}</div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {child.group && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{child.group}</span>}
                    {child.birthDate && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{child.birthDate}</span>}
                  </div>
                  {child.parentName && <div className="text-sm text-gray-500 mt-2">保護者: {child.parentName}</div>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(child)} className="p-2 text-gray-400 hover:text-blue-500 cursor-pointer"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(child.id)} className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editChild ? '園児情報を編集' : '園児を登録'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="氏名" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="山田 花子" />
              <InputField label="ふりがな" value={form.kana} onChange={e => setForm(p => ({ ...p, kana: e.target.value }))} placeholder="やまだ はなこ" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="生年月日" type="date" value={form.birthDate} onChange={e => setForm(p => ({ ...p, birthDate: e.target.value }))} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">クラス</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" value={form.group} onChange={e => setForm(p => ({ ...p, group: e.target.value }))}>
                  <option value="">選択してください</option>
                  {groups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="保護者名" value={form.parentName} onChange={e => setForm(p => ({ ...p, parentName: e.target.value }))} />
              <InputField label="連絡先" type="tel" value={form.parentContact} onChange={e => setForm(p => ({ ...p, parentContact: e.target.value }))} />
            </div>
            <TextareaField label="特記事項・アレルギー等" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
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
