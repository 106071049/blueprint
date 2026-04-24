'use client';

export default function DepartmentTabs({ tabs, counts, value, onChange }) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2">
      <div className="flex flex-wrap gap-1">
        {tabs.map((d) => (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={`tab-btn ${
              value === d ? 'active' : ''
            } px-5 py-3 rounded-lg text-sm font-medium border border-transparent text-[var(--text-muted)] hover:text-[var(--text)]`}
          >
            {d}
            <span className="ml-2 text-xs text-[var(--text-muted)]">({counts[d] ?? 0})</span>
          </button>
        ))}
      </div>
    </section>
  );
}
