export default function StatsOverview({ stats }) {
  const cards = [
    {
      label: '全部項目',
      value: stats.total,
      sub: '個開發項目',
      accent: 'from-blue-500/20 to-blue-500/5',
      text: 'text-blue-300',
    },
    {
      label: '已完成',
      value: stats.done,
      sub: `完成率 ${stats.completionRate}%`,
      accent: 'from-emerald-500/20 to-emerald-500/5',
      text: 'text-emerald-300',
    },
    {
      label: '進行中',
      value: stats.inProgress,
      sub: '開發中項目',
      accent: 'from-amber-500/20 to-amber-500/5',
      text: 'text-amber-300',
    },
    {
      label: '規劃中',
      value: stats.planning,
      sub: '待啟動項目',
      accent: 'from-slate-500/20 to-slate-500/5',
      text: 'text-slate-300',
    },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(c => (
        <div
          key={c.label}
          className={`relative overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-br ${c.accent} bg-[var(--panel)] p-5`}
        >
          <div className="text-xs text-[var(--text-muted)]">{c.label}</div>
          <div className={`mt-1 text-4xl font-bold tabular-nums ${c.text}`}>
            {c.value}
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">{c.sub}</div>
        </div>
      ))}
    </section>
  );
}
