'use client';

import { useEffect, useState } from 'react';

export default function ScheduleEditor({ project, onChange }) {
  const [notes, setNotes] = useState(project.notes || '');
  const [duration, setDuration] = useState(project.durationDays ?? '');
  useEffect(() => { setNotes(project.notes || ''); }, [project.notes]);
  useEffect(() => { setDuration(project.durationDays ?? ''); }, [project.durationDays]);

  const stop = (e) => e.stopPropagation();
  const saveNotes = () => {
    if ((project.notes || '') !== notes) onChange({ notes });
  };
  const saveDuration = () => {
    const v = duration === '' ? null : Number(duration);
    if (v !== project.durationDays) onChange({ durationDays: v });
  };

  return (
    <div onClick={stop}>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <Field label="工作天數（留空 = 用預設）">
          <input
            type="number" min="1" max="999"
            className="form-input w-full"
            placeholder="例：20"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            onBlur={saveDuration}
          />
        </Field>
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
            onBlur={saveNotes}
          />
        </Field>
      </div>
      <p className="text-[10px] text-[var(--text-muted)] mt-2">
        提示：按上方「重新計算排程」會依項目順序重算所有日期，會覆訊手動調整的日期。
      </p>
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
