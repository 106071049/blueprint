'use client';

import { useEffect, useMemo, useState } from 'react';
import { useProjectsApi } from '@/hooks/useProjectsApi';
import StatsOverview from './StatsOverview';
import DepartmentProgress from './DepartmentProgress';
import DepartmentTabs from './DepartmentTabs';
import ProjectTable from './ProjectTable';
import FilterBar from './FilterBar';
import AddProjectModal from './AddProjectModal';

const DEFAULT_DEPARTMENTS = ['評價部', '管理部'];

export default function Dashboard() {
  const [department, setDepartment] = useState('全部');
  const [status, setStatus] = useState('全部');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const api = useProjectsApi();

  const allProjects = api.projects;

  const allDepartments = useMemo(() => {
    const set = new Set(DEFAULT_DEPARTMENTS);
    allProjects.forEach((p) => p.department && set.add(p.department));
    return Array.from(set);
  }, [allProjects]);

  const filtered = useMemo(() => {
    return allProjects.filter((p) => {
      if (department !== '全部' && p.department !== department) return false;
      if (status !== '全部' && p.status !== status) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !(p.tag || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allProjects, department, status, query]);

  const stats = useMemo(() => {
    const total = allProjects.length;
    const done = allProjects.filter((p) => p.status === '已完成').length;
    const inProgress = allProjects.filter((p) => p.status === '進行中').length;
    const planning = allProjects.filter((p) => p.status === '規劃中').length;
    return { total, done, inProgress, planning, completionRate: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [allProjects]);

  const statsByDept = useMemo(() => {
    const result = {};
    allDepartments.forEach((dept) => {
      const dp = allProjects.filter((p) => p.department === dept);
      const s = {
        total: dp.length,
        done: dp.filter((p) => p.status === '已完成').length,
        inProgress: dp.filter((p) => p.status === '進行中').length,
        planning: dp.filter((p) => p.status === '規劃中').length,
      };
      s.completionRate = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
      result[dept] = s;
    });
    return result;
  }, [allProjects, allDepartments]);

  const tabs = ['全部', ...allDepartments];
  const tabCounts = useMemo(() => {
    const c = { '全部': allProjects.length };
    allDepartments.forEach((d) => { c[d] = allProjects.filter((p) => p.department === d).length; });
    return c;
  }, [allProjects, allDepartments]);

  const handleAddProject = async (p) => {
    try {
      const created = await api.createProject(p);
      setModalOpen(false);
      if (department !== '全部' && department !== created.department) {
        setDepartment('全部');
      }
    } catch (e) {
      // error is shown via api.error
    }
  };

  // 只在 client 端計算時間，避免 hydration mismatch
  const [lastUpdate, setLastUpdate] = useState('');
  useEffect(() => {
    const tick = () => setLastUpdate(new Date().toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    }));
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--panel)]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">AI 中心 · 開發藍圖 Dashboard</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">華淵鑑價 · 2026 數位轉型總藍圖追蹤 · <span className="text-emerald-300">即時同步 MySQL</span></p>
          </div>
          <div className="flex items-center gap-3">
            {api.loading && <span className="text-xs text-[var(--text-muted)]">載入中...</span>}
            <span className="save-chip transition-opacity" style={{ opacity: api.saveFlash ? 1 : 0 }}>✓ 已儲存</span>
            <button className="btn" onClick={api.refresh} title="重新載入">↻</button>
            <div className="text-right text-xs text-[var(--text-muted)]">
              <div>最後更新</div>
              <div className="text-[var(--text)] font-medium" suppressHydrationWarning>{lastUpdate || '—'}</div>
            </div>
          </div>
        </div>
        {api.error && (
          <div className="max-w-[1600px] mx-auto px-6 pb-3">
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 text-sm px-4 py-2 flex items-center justify-between">
              <span>⚠ {api.error}</span>
              <button onClick={api.clearError} className="text-red-300 hover:text-red-100">✕</button>
            </div>
          </div>
        )}
      </header>
      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {api.loading && allProjects.length === 0 ? (
          <LoadingState />
        ) : (
          <>
            <StatsOverview stats={stats} />
            <DepartmentProgress statsByDept={statsByDept} departments={allDepartments} onSelectDepartment={setDepartment} />
            <DepartmentTabs tabs={tabs} counts={tabCounts} value={department} onChange={setDepartment} />
            <FilterBar
              status={status} setStatus={setStatus}
              query={query} setQuery={setQuery}
              statuses={['全部', '已完成', '已完成第一版，版更優化中', '進行中', '規劃中']}
              resultCount={filtered.length} totalCount={allProjects.length}
              onAddProject={() => setModalOpen(true)}
            />
            <ProjectTable projects={filtered} department={department} api={api} />
          </>
        )}
      </div>
      <footer className="border-t border-[var(--border)] mt-10 py-6 text-center text-xs text-[var(--text-muted)]">
        AI 中心 開發藍圖 · Powered by Next.js + Prisma + MySQL · Deployed on Vercel
      </footer>
      <AddProjectModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddProject} departments={allDepartments} />

      {/* Tech-style Toast Notification */}
      {api.toast && (
        <div className="fixed bottom-6 right-6 z-50 toast-slide-up">
          <div className="relative overflow-hidden rounded-lg border border-emerald-500/50 bg-[#0f172a]/95 backdrop-blur-md p-4 pr-12 shadow-[0_0_25px_rgba(16,185,129,0.25)] w-[340px] max-w-[calc(100vw-3rem)]">
            {/* Top glowing line */}
            <div className="absolute top-0 left-0 h-[2px] w-full bg-emerald-400 shadow-[0_0_12px_#34d399] toast-pulse"></div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="relative flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-400/10">
                   <div className="absolute h-2 w-2 rounded-full bg-emerald-400 animate-ping"></div>
                   <svg className="relative h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                   </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-[12px] font-bold text-emerald-400 tracking-wider font-mono uppercase mb-1">SYSTEM_UPDATE // SUCCESS</h3>
                <p className="text-sm text-slate-300 leading-snug">{api.toast.message}</p>
              </div>
              <button 
                onClick={api.hideToast} 
                className="absolute top-4 right-4 text-slate-500 hover:text-emerald-300 transition-colors"
                title="關閉"
              >
                ✕
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-emerald-900/50 w-full">
              <div className="h-full bg-emerald-400 toast-progress shadow-[0_0_8px_#34d399]" style={{ '--duration': `${api.toast.duration}ms` }}></div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0,1,2,3].map((i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 h-24 animate-pulse" />
        ))}
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 h-40 animate-pulse" />
      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-10 text-center text-[var(--text-muted)]">
        正在從資料庫載入專案清單...
      </div>
    </div>
  );
}
