// Working-days helpers (週一 ~ 週五)
// 全部使用 UTC 避免 server / client 時區差異

function isWeekendUtc(d) { const dow = d.getUTCDay(); return dow === 0 || dow === 6; }

export function nextWorkingDay(date) {
  const d = new Date(date.getTime ? date.getTime() : date);
  while (isWeekendUtc(d)) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

// 從 d 開始，加 n 個工作日（n=0 表示 d 本身，若 d 是週末則推至下個工作日）
export function addWorkingDays(date, n) {
  let d = nextWorkingDay(date);
  let added = 0;
  while (added < n) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (!isWeekendUtc(d)) added++;
  }
  return d;
}

// 將 'YYYY-MM-DD' 字串 轉為 UTC midnight Date
export function parseDateUtc(s) {
  if (!s) return null;
  if (s instanceof Date) return new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()));
  const [y, m, d] = String(s).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

export function toIso(d) {
  const pad = (x) => String(x).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

// 依 sort_order 順序連鎖計算
export function computeSchedule(projects, startDate, defaultDuration) {
  const sorted = [...projects].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  let cursor = nextWorkingDay(parseDateUtc(startDate));
  return sorted.map((p) => {
    const dur = (p.durationDays && p.durationDays > 0) ? p.durationDays : defaultDuration;
    const start = new Date(cursor.getTime());
    const end = addWorkingDays(start, dur - 1);
    cursor = addWorkingDays(end, 1);
    return { id: p.id, plannedStart: toIso(start), plannedEnd: toIso(end), durationDays: dur };
  });
}
