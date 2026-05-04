'use client';

import { useState, Fragment } from 'react';
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, useSortable, verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ScheduleEditor from './ScheduleEditor';
import SubtasksEditor from './SubtasksEditor';

const statusStyle = {
  '已完成': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  '已完成第一版，版更優化中': 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  '進行中': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  '規劃中': 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};
const deptStyle = {
  '評價部': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  '管理部': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
};
const progressColor = (s) =>
  s === '已完成' ? 'bg-emerald-500' :
  s === '已完成第一版，版更優化中' ? 'bg-teal-500' :
  s === '進行中' ? 'bg-amber-500' : 'bg-slate-500';

export default function ProjectTable({ projects, department, api }) {
  const [expanded, setExpanded] = useState(null);
  const [activeDragId, setActiveDragId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (e) => {
    setActiveDragId(e.active.id);
    setExpanded(null); // 展開中的項目在拖曳時自動收起
  };

  const handleDragEnd = (e) => {
    setActiveDragId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = projects.findIndex((p) => p.id === active.id);
    const newIdx = projects.findIndex((p) => p.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const newOrder = arrayMove(projects, oldIdx, newIdx);
    api.reorderProjects(newOrder.map((p) => p.id));
  };

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-10 text-center text-[var(--text-muted)]">沒有符合條件的項目</div>
    );
  }

  const handleDelete = async (p) => {
    if (!confirm('確定要刪除這個項目嗎？此動作無法復原。')) return;
    if (expanded === p.id) setExpanded(null);
    await api.deleteProject(p.id);
  };

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold">{department === '全部' ? '全部項目' : `${department} 項目`}</div>
          {api.pendingReorderIds && (
            <div className="flex items-center gap-2">
              <button
                onClick={api.saveReorder}
                disabled={api.isSavingOrder}
                className={`text-xs px-3 py-1.5 text-white rounded shadow-sm transition-colors ${
                  api.isSavingOrder ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {api.isSavingOrder ? '儲存中...' : '儲存排序'}
              </button>
              <button
                onClick={api.cancelReorder}
                disabled={api.isSavingOrder}
                className={`text-xs px-3 py-1.5 bg-[var(--panel-2)] text-[var(--text)] border border-[var(--border)] rounded transition-colors ${
                  api.isSavingOrder ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--border)]'
                }`}
              >
                取消
              </button>
            </div>
          )}
        </div>
        <div className="text-xs text-[var(--text-muted)]">拖曳左側 ⋮⋮ 調整順序 · 點擊列展開詳情</div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <table className="w-full text-sm">
              <thead className="bg-[var(--panel-2)] text-[var(--text-muted)] text-xs uppercase tracking-wider">
                <tr>
                  <th className="w-8"></th>
                  <th className="text-left px-4 py-3 font-medium hide-on-ipad-portrait">#</th>
                  <th className="text-left px-4 py-3 font-medium">項目名稱</th>
                  <th className="text-left px-4 py-3 font-medium">部門</th>
                  <th className="text-left px-4 py-3 font-medium hide-on-ipad-portrait">分類</th>
                  <th className="text-left px-4 py-3 font-medium">狀態</th>
                  <th className="text-left px-4 py-3 font-medium w-32">進度</th>
                  <th className="text-left px-4 py-3 font-medium hide-below-820">細項</th>
                  <th className="text-left px-4 py-3 font-medium hide-below-640">預計期程</th>
                  <th className="text-right px-4 py-3 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, idx) => (
                  <SortableRow
                    key={p.id}
                    p={p}
                    idx={idx}
                    isOpen={expanded === p.id}
                    onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
                    onDelete={handleDelete}
                    api={api}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>
    </section>
  );
}

function SortableRow({ p, idx, isOpen, onToggle, onDelete, api }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    background: isDragging ? '#1a2352' : undefined,
  };
  const subs = p.subtasks || [];
  const subDone = subs.filter((s) => s.done).length;
  const subTotal = subs.length;
  const plannedRange = (p.plannedStart || p.plannedEnd)
    ? `${p.plannedStart || '—'} ~ ${p.plannedEnd || '—'}`
    : '—';

  return (
    <Fragment>
      <tr ref={setNodeRef} style={style} className="project-row border-t border-[var(--border)] hover:bg-[var(--panel-2)]/50 transition-colors">
        <td className="px-2 py-2 align-middle" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="drag-handle"
            title="拖曳調整順序"
            {...attributes}
            {...listeners}
          >⋮⋮</button>
        </td>
        <td className="px-4 py-3 text-[var(--text-muted)] tabular-nums hide-on-ipad-portrait cursor-pointer" onClick={onToggle}>{String(idx + 1).padStart(2, '0')}</td>
        <td className="px-4 py-3 font-medium cursor-pointer" onClick={onToggle}>
          {p.name}
          {p.isCustom && <span className="custom-badge">自訂</span>}
        </td>
        <td className="px-4 py-3 cursor-pointer" onClick={onToggle}>
          <span className={`inline-flex px-2 py-0.5 rounded border text-xs ${deptStyle[p.department] || 'bg-gray-500/15 text-gray-300 border-gray-500/30'}`}>{p.department}</span>
        </td>
        <td className="px-4 py-3 text-[var(--text-muted)] text-xs hide-on-ipad-portrait cursor-pointer" onClick={onToggle}>{p.tag || '—'}</td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <select
            className={`text-xs rounded border px-1.5 py-0.5 cursor-pointer ${statusStyle[p.status] || ''}`}
            style={{ background: '#1e2a3a' }}
            value={p.status}
            onChange={(e) => api.updateProject(p.id, { status: e.target.value })}
          >
            <option value="規劃中">規劃中</option>
            <option value="進行中">進行中</option>
            <option value="已完成第一版，版更優化中">已完成第一版，版更優化中</option>
            <option value="已完成">已完成</option>
          </select>
        </td>
        <td className="px-4 py-3 cursor-pointer" onClick={onToggle}>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 rounded-full bg-slate-700/40 overflow-hidden">
              <div className={`h-full ${progressColor(p.status)}`} style={{ width: `${p.progress}%` }} />
            </div>
            <span className="text-xs text-[var(--text-muted)] tabular-nums w-10">{p.progress}%</span>
          </div>
        </td>
        <td className="px-4 py-3 text-[var(--text-muted)] text-xs hide-below-820 cursor-pointer" onClick={onToggle}>
          {subTotal > 0 ? (<span><span className="text-emerald-300">{subDone}</span>/{subTotal}</span>) : '—'}
        </td>
        <td className="px-4 py-3 text-[var(--text-muted)] text-xs whitespace-nowrap hide-below-640 cursor-pointer" onClick={onToggle}>{plannedRange}</td>
        <td className="px-4 py-3 text-right text-[var(--text-muted)] cursor-pointer" onClick={onToggle}>
          <span className={`inline-block transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
        </td>
      </tr>
      {isOpen && (
        <tr className="border-t border-[var(--border)] bg-[var(--panel-2)]/30">
          <td colSpan={10} className="px-6 py-5">
            <div className="space-y-5">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-brand-500 font-semibold mb-2">
                  {p.isCustom ? '藍圖設定（使用者新增）' : '藍圖設定（來自 Excel）'}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
                  <BlueprintField label="希望 AI 改善方向" value={p.aiDirection} />
                  <BlueprintField label="預期輸出成果" value={p.expectedOutput} />
                  <BlueprintField label="任務步驟 / 邏輯" value={p.logic} />
                </div>
              </div>
              <div className="border-t border-[var(--border)]" />
              <ScheduleEditor project={p} onChange={(patch) => api.updateProject(p.id, patch)} />
              <div className="border-t border-[var(--border)]" />
              <SubtasksEditor
                project={p}
                onAdd={(title) => api.addSubtask(p.id, title)}
                onUpdate={(sid, patch) => api.updateSubtask(p.id, sid, patch)}
                onRemove={(sid) => api.deleteSubtask(p.id, sid)}
              />
              {p.isCustom && (
                <>
                  <div className="border-t border-[var(--border)]" />
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-[var(--text-muted)]">此為使用者自訂項目（不在 Excel 藍圖中）</div>
                    <button
                      className="btn"
                      style={{ color: '#fca5a5', borderColor: 'rgba(248,113,113,.3)', background: 'rgba(127,29,29,.15)' }}
                      onClick={(e) => { e.stopPropagation(); onDelete(p); }}
                    >✕ 刪除此項目</button>
                  </div>
                </>
              )}
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}

function BlueprintField({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">{label}</div>
      <div className="text-[var(--text)] whitespace-pre-wrap leading-relaxed text-xs">{value || '—'}</div>
    </div>
  );
}
