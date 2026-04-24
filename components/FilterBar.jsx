'use client';

export default function FilterBar({
  status, setStatus, query, setQuery, statuses,
  resultCount, totalCount, onAddProject,
}) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">狀態</span>
            <div className="flex rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-0.5">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    status === s ? 'bg-brand-600 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="搜尋項目名稱或標籤..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-60 form-input !py-1.5 !text-sm"
          />
          <div className="text-xs text-[var(--text-muted)] whitespace-nowrap">
            顯示 <span className="text-[var(--text)] font-semibold">{resultCount}</span> / {totalCount}
          </div>
          {onAddProject && (
            <button onClick={onAddProject} className="btn btn-primary">+ 新增項目</button>
          )}
        </div>
      </div>
    </section>
  );
}
