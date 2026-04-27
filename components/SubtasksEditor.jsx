'use client';

import { useEffect, useRef, useState } from 'react';

export default function SubtasksEditor({ project, onAdd, onUpdate, onRemove }) {
  const [newTitle, setNewTitle] = useState('');
  const subs = project.subtasks || [];
  const subDone = subs.filter((s) => s.done).length;
  const subTotal = subs.length;

  const avgProgress = subTotal > 0
    ? Math.round(subs.reduce((acc, s) => {
        const v = s.manualProgress != null ? s.manualProgress : (s.done ? 100 : 0);
        return acc + v;
      }, 0) / subTotal)
    : 0;

  const stop = (e) => e.stopPropagation();
  const submitAdd = (e) => {
    e.preventDefault();
    const v = newTitle.trim();
    if (!v) return;
    onAdd(v);
    setNewTitle('');
  };

  return (
    <div onClick={stop}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold">
          細項任務
        </div>
        <div className="text-[10px] text-[var(--text-muted)]">
          {subTotal > 0
            ? `已完成 ${subDone} / ${subTotal}・平均進度 ${avgProgress}%`
            : '目前沒有細項'}
        </div>
      </div>

      <div className="space-y-1.5 mb-2">
        {subs.map((s) => (
          <SubtaskRow key={s.id} s={s} onUpdate={onUpdate} onRemove={onRemove} />
        ))}
      </div>

      <form className="flex items-center gap-2" onSubmit={submitAdd}>
        <input
          type="text"
          className="form-input flex-1"
          placeholder="新增細項任務，例：需求訪談、原型開發..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">+ 新增</button>
      </form>
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: 'planning',    label: '規劃中', color: '#94a3b8' },
  { value: 'in_progress', label: '進行中', color: '#f59e0b' },
  { value: 'done',        label: '已完成', color: '#10b981' },
];

function SubtaskRow({ s, onUpdate, onRemove }) {
  const [title, setTitle] = useState(s.title);
  const savedProgress = s.manualProgress != null ? s.manualProgress : (s.done ? 100 : 0);
  const [localProgress, setLocalProgress] = useState(savedProgress);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => { setTitle(s.title); }, [s.title]);
  useEffect(() => {
    const v = s.manualProgress != null ? s.manualProgress : (s.done ? 100 : 0);
    setLocalProgress(v);
  }, [s.manualProgress, s.done]);

  const isDirty = localProgress !== savedProgress;

  const handleConfirm = () => {
    onUpdate(s.id, { manualProgress: localProgress });
    setSaved(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaved(false), 1800);
  };

  const handleProgressInput = (e) => {
    const v = Math.min(100, Math.max(0, Number(e.target.value)));
    setLocalProgress(v);
  };

  const currentStatus = s.status || 'planning';
  const statusMeta = STATUS_OPTIONS.find((o) => o.value === currentStatus) || STATUS_OPTIONS[0];

  return (
    <div className={`subtask-row ${s.done ? 'done' : ''}`} style={{ flexWrap: 'wrap', gap: '6px' }}>
      <input
        type="checkbox"
        className="check"
        checked={s.done}
        onChange={(e) => onUpdate(s.id, { done: e.target.checked })}
      />

      {/* Status dropdown */}
      <select
        className="form-input !py-0.5 !px-1.5 !text-[11px] shrink-0"
        style={{ color: statusMeta.color, borderColor: statusMeta.color + '55', width: '68px' }}
        value={currentStatus}
        onChange={(e) => onUpdate(s.id, { status: e.target.value })}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <input
        type="text"
        className="subtask-title flex-1 bg-transparent border-0 p-0 text-xs text-[var(--text)] focus:outline-none focus:ring-0"
        style={{ minWidth: '80px' }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => { if (title !== s.title) onUpdate(s.id, { title }); }}
      />

      {/* Progress area */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="h-1.5 w-16 rounded-full bg-slate-700/40 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${localProgress}%`,
              background: localProgress === 100 ? '#10b981' : localProgress > 0 ? '#f59e0b' : '#64748b',
            }}
          />
        </div>
        <input
          type="number"
          min="0"
          max="100"
          className="form-input !py-0.5 !px-1 !text-[11px] tabular-nums"
          style={{ width: '46px', textAlign: 'center' }}
          value={localProgress}
          onChange={handleProgressInput}
        />
        <span className="text-[10px] text-[var(--text-muted)]">%</span>
      </div>

      <input
        type="date"
        className="form-input !py-1 !text-[11px]"
        value={s.dueDate || ''}
        onChange={(e) => onUpdate(s.id, { dueDate: e.target.value })}
      />

      {/* Confirm button */}
      <button
        className="btn btn-primary !py-0.5 !px-2 !text-[11px] shrink-0"
        style={{
          opacity: isDirty ? 1 : 0.45,
          background: saved ? '#10b981' : undefined,
          borderColor: saved ? '#10b981' : undefined,
          cursor: isDirty ? 'pointer' : 'default',
          minWidth: '42px',
        }}
        onClick={handleConfirm}
        title="確定儲存進度"
      >
        {saved ? '✓ 已存' : '確定'}
      </button>

      <button className="btn-danger btn !py-0.5 !px-1.5 !text-[11px] shrink-0" title="移除" onClick={() => onRemove(s.id)}>✕</button>
    </div>
  );
}
