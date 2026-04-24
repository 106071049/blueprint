'use client';

import { useEffect, useState } from 'react';

export default function SubtasksEditor({ project, onAdd, onUpdate, onRemove }) {
  const [newTitle, setNewTitle] = useState('');
  const subs = project.subtasks || [];
  const subDone = subs.filter((s) => s.done).length;
  const subTotal = subs.length;

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
          細項任務（可編輯，自動儲存到 DB）
        </div>
        <div className="text-[10px] text-[var(--text-muted)]">
          {subTotal > 0
            ? `已完成 ${subDone} / ${subTotal}（${Math.round((subDone / subTotal) * 100)}%）`
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

function SubtaskRow({ s, onUpdate, onRemove }) {
  const [title, setTitle] = useState(s.title);
  useEffect(() => { setTitle(s.title); }, [s.title]);

  return (
    <div className={`subtask-row ${s.done ? 'done' : ''}`}>
      <input
        type="checkbox"
        className="check"
        checked={s.done}
        onChange={(e) => onUpdate(s.id, { done: e.target.checked })}
      />
      <input
        type="text"
        className="subtask-title flex-1 bg-transparent border-0 p-0 text-xs text-[var(--text)] focus:outline-none focus:ring-0"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => { if (title !== s.title) onUpdate(s.id, { title }); }}
      />
      <input
        type="date"
        className="form-input !py-1 !text-[11px]"
        value={s.dueDate || ''}
        onChange={(e) => onUpdate(s.id, { dueDate: e.target.value })}
      />
      <button className="btn-danger btn" title="移除" onClick={() => onRemove(s.id)}>✕</button>
    </div>
  );
}
