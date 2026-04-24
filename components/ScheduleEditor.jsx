'use client';

import { useEffect, useState } from 'react';

export default function ScheduleEditor({ project, onChange }) {
  // Local state for text inputs (debounced save on blur)
  const [notes, setNotes] = useState(project.notes || '');
  useEffect(() => { setNotes(project.notes || ''); }, [project.notes]);

  const stop = (e) => e.stopPropagation();
  const saveField = (field, value) => {
    if ((project[field] || '') === (value || '')) return;
    onChange({ [field]: value });
  };

  return (
    <div onClick={stop}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">
          預計排程（可編輯，自動儲存到 DB）
        </div>
        {project.owner && (
          <div className="text-[11px] text-[var(--text-muted)]">
            負責人：<span className="text-[var(--text)] font-medium">{project.owner}</span>
            {project.ownerTitle && <span className="text-[var(--text-muted)]"> · {project.ownerTitle}</span>}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        <Field label="預計開始">
          <input
            type="date"
            className="form-input w-full"
            value={project.plannedStart || ''}
            onChange={(e) => onChange({ plannedStart: e.target.value })}
          />
        </Field>
        <Field label="預計完成">
          <input
            type="date"
            className="form-input w-full"
            value={project.plannedEnd || ''}
            onChange={(e) => onChange({ plannedEnd: e.target.value })}
          />
        </Field>
        <Field label="備註">
          <input
            type="text"
            className="form-input w-full"
            placeholder="額外資訊..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => saveField('notes', notes)}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] text-[var(--text-muted)] mb-1">{label}</label>
      {children}
    </div>
  );
}
