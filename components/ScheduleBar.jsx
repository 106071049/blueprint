'use client';

import { useState } from 'react';

export default function ScheduleBar({ settings, onUpdateSettings, onRecompute, projectCount }) {
  const [computing, setComputing] = useState(false);
  const startDate = settings['schedule.globalStartDate'] || '2026-04-27';
  const defaultDuration = settings['schedule.defaultDurationDays'] || '20';

  const handleRecompute = async () => {
    if (!confirm(`將依現在順序重新計算全部 ${projectCount} 項的預計開始 / 完成日。\n\n全域起始日：${startDate}\n預設工作天數：${defaultDuration}\n\n確定要重新計算嗎？`)) return;
    setComputing(true);
    await onRecompute();
    setComputing(false);
  };

  return (
    <section className="rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-[var(--panel)] p-4">
      <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-5">
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider text-orange-300 font-semibold mb-2">
            自動排程設定
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            依項目現在順序（由上而下）連鎖計算預計日期。只計工作天（週一 ~ 週五），週末自動跳過。
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1">全域起始日</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => onUpdateSettings({ 'schedule.globalStartDate': e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1">預設工作天數</label>
            <input
              type="number" min="1" max="999"
              className="form-input w-24"
              value={defaultDuration}
              onChange={(e) => onUpdateSettings({ 'schedule.defaultDurationDays': e.target.value })}
            />
          </div>
          <button
            className="btn"
            disabled={computing}
            onClick={handleRecompute}
            style={{ background: computing ? '#5a6898' : '#ea580c', borderColor: computing ? '#5a6898' : '#ea580c', color: '#fff' }}
          >
            {computing ? '計算中...' : '重新計算排程'}
          </button>
        </div>
      </div>
    </section>
  );
}
