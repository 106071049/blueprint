'use client';

import { useEffect, useState } from 'react';

const initial = {
  name: '',
  department: '',
  status: '規劃中',
  tag: '',
  frequency: '',
  aiDirection: '',
  expectedOutput: '',
  logic: '',
};

export default function AddProjectModal({ open, onClose, onSubmit, departments }) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (open) {
      setForm({ ...initial, department: departments[0] || '評價部' });
    }
  }, [open, departments]);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { alert('請填寫項目名稱'); return; }
    onSubmit({
      name: form.name.trim(),
      department: (form.department.trim() || '未分類'),
      status: form.status,
      tag: form.tag.trim() || '自訂',
      frequency: form.frequency.trim() || '—',
      aiDirection: form.aiDirection.trim() || '—',
      expectedOutput: form.expectedOutput.trim() || '—',
      logic: form.logic.trim() || '—',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="text-lg font-semibold">新增開發項目</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">項目建立後可在列表中繼續編輯排程、新增細項</p>
          </div>
          <button className="btn-danger btn" onClick={onClose} title="關閉">✕</button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="項目名稱" required>
              <input type="text" className="form-input w-full" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="例：新機器人 X" />
            </Field>
            <Field label="部門" required>
              <input list="dept-opts" type="text" className="form-input w-full" required value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="選擇或輸入新部門" />
              <datalist id="dept-opts">
                {departments.map((d) => <option key={d} value={d} />)}
              </datalist>
            </Field>
            <Field label="狀態">
              <select className="form-input w-full" value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="規劃中">規劃中</option>
                <option value="進行中">進行中</option>
                <option value="已完成">已完成</option>
              </select>
            </Field>
            <Field label="分類 / 標籤">
              <input type="text" className="form-input w-full" value={form.tag} onChange={(e) => set('tag', e.target.value)} placeholder="例：機器人、爬蟲" />
            </Field>
            <div className="md:col-span-2">
              <Field label="執行頻率">
                <input type="text" className="form-input w-full" value={form.frequency} onChange={(e) => set('frequency', e.target.value)} placeholder="例：每個案件、每月 1 次" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="希望 AI 改善方向">
                <textarea className="form-input w-full" rows={3} value={form.aiDirection} onChange={(e) => set('aiDirection', e.target.value)} placeholder="描述希望 AI 如何協助..." />
              </Field>
            </div>
            <Field label="預期輸出成果">
              <textarea className="form-input w-full" rows={3} value={form.expectedOutput} onChange={(e) => set('expectedOutput', e.target.value)} placeholder="預期產出什麼..." />
            </Field>
            <Field label="任務步驟 / 邏輯">
              <textarea className="form-input w-full" rows={3} value={form.logic} onChange={(e) => set('logic', e.target.value)} placeholder="執行邏輯..." />
            </Field>
          </div>
          <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-[var(--border)]">
            <button type="button" className="btn" onClick={onClose}>取消</button>
            <button type="submit" className="btn btn-primary">建立項目</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs text-[var(--text-muted)] mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
