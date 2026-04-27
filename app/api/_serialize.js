// app/api/_serialize.js
// Convert a Prisma Project (snake_case via @map) back into the UI shape

export function serializeProject(p) {
  if (!p) return null;
  const primaryOwner = (p.owners && p.owners[0]) ? p.owners[0].user : null;
  return {
    id: String(p.id),
    code: p.code,
    department: p.department?.name || null,
    departmentId: p.departmentId,
    name: p.name,
    status: statusToZh(p.status),
    _rawStatus: p.status,
    progress: computeProgress(p),
    tag: p.tag || '',
    frequency: p.frequency || '',
    aiDirection: p.aiDirection || '',
    expectedOutput: p.expectedOutput || '',
    logic: p.logic || '',
    plannedStart: p.plannedStart ? toIsoDate(p.plannedStart) : '',
    plannedEnd: p.plannedEnd ? toIsoDate(p.plannedEnd) : '',
    actualStart: p.actualStart ? toIsoDate(p.actualStart) : '',
    actualEnd: p.actualEnd ? toIsoDate(p.actualEnd) : '',
    manualProgress: p.manualProgress,
    durationDays: p.durationDays,
    notes: p.notes || '',
    isCustom: p.isCustom,
    isArchived: p.isArchived,
    owner: primaryOwner ? primaryOwner.displayName : '',
    ownerTitle: primaryOwner ? (primaryOwner.title || '') : '',
    ownerEmail: primaryOwner ? primaryOwner.email : '',
    owners: (p.owners || []).map((o) => ({
      id: String(o.user.id),
      name: o.user.displayName,
      title: o.user.title || '',
      email: o.user.email,
      role: o.roleInProject,
    })),
    subtasks: (p.subtasks || []).map(serializeSubtask),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export function serializeSubtask(s) {
  return {
    id: String(s.id),
    projectId: String(s.projectId),
    title: s.title,
    description: s.description || '',
    done: s.isDone,
    dueDate: s.dueDate ? toIsoDate(s.dueDate) : '',
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export function statusToZh(s) {
  return { done: '已完成', in_progress: '進行中', planning: '規劃中', archived: '已封存' }[s] || s;
}
export function statusFromZh(zh) {
  return { '已完成':'done', '進行中':'in_progress', '規劃中':'planning', '已封存':'archived' }[zh] || zh;
}

export function computeProgress(p) {
  if (p.manualProgress != null) return p.manualProgress;
  if (p.subtasks && p.subtasks.length > 0) {
    const done = p.subtasks.filter(s => s.isDone).length;
    return Math.round((done / p.subtasks.length) * 100);
  }
  return p.status === 'done' ? 100 : (p.status === 'in_progress' ? 50 : 0);
}

export function toIsoDate(d) {
  if (!d) return '';
  const dt = (d instanceof Date) ? d : new Date(d);
  return dt.toISOString().slice(0, 10);
}

export function parseDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
