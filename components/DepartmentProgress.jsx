'use client';

export default function DepartmentProgress({ statsByDept, departments, onSelectDepartment }) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold">客戶部門進度</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">目前 AI 中心客戶：{departments.join('、')}（未來將擴充其他部門）</p>
        </div>
        <div className="text-xs text-[var(--text-muted)]">共 {departments.length} 個部門</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => {
          const s = statsByDept[dept] || { total: 0, done: 0, inProgress: 0, planning: 0, completionRate: 0 };
          const donePct = s.total ? (s.done / s.total) * 100 : 0;
          const inPct = s.total ? (s.inProgress / s.total) * 100 : 0;
          return (
            <button key={dept} onClick={() => onSelectDepartment && onSelectDepartment(dept)} className="text-left rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-4 hover:border-brand-500 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-500" />
                  <h3 className="font-semibold text-base">{dept}</h3>
                  <span className="text-xs text-[var(--text-muted)]">共 {s.total} 項</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-300 tabular-nums">{s.completionRate}%</div>
                  <div className="text-[10px] text-[var(--text-muted)]">完成率</div>
                </div>
              </div>
              <div className="h-2.5 w-full rounded-full overflow-hidden bg-slate-700/40 flex">
                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${donePct}%` }} />
                <div className="bg-amber-500 h-full transition-all" style={{ width: `${inPct}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />已完成 {s.done}</span>
                <span className="flex items-center gap-1.5 text-amber-300"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />進行中 {s.inProgress}</span>
                <span className="flex items-center gap-1.5 text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-slate-500" />規劃中 {s.planning}</span>
              </div>
              <div className="mt-2 text-[10px] text-brand-500 text-right">點擊切換至此部門 →</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
