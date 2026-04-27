import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeProject, statusFromZh, parseDate } from '../../_serialize';
import { addWorkingDays, parseDateUtc } from '@/lib/workdays';

const PROJECT_INCLUDE = {
  department: true,
  subtasks: { orderBy: { sortOrder: 'asc' } },
  owners: { include: { user: true }, orderBy: { assignedAt: 'asc' } },
};

export async function GET(_req, { params }) {
  const id = Number(params.id);
  const p = await prisma.project.findUnique({ where: { id }, include: PROJECT_INCLUDE });
  if (!p) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(serializeProject(p));
}

export async function PATCH(req, { params }) {
  const id = Number(params.id);
  const body = await req.json();

  const data = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.status !== undefined) data.status = statusFromZh(body.status);
  if (body.tag !== undefined) data.tag = body.tag;
  if (body.frequency !== undefined) data.frequency = body.frequency;
  if (body.aiDirection !== undefined) data.aiDirection = body.aiDirection;
  if (body.expectedOutput !== undefined) data.expectedOutput = body.expectedOutput;
  if (body.logic !== undefined) data.logic = body.logic;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.plannedStart !== undefined) data.plannedStart = parseDate(body.plannedStart);
  if (body.plannedEnd !== undefined) data.plannedEnd = parseDate(body.plannedEnd);
  if (body.manualProgress !== undefined) data.manualProgress = body.manualProgress;
  if (body.durationDays !== undefined) data.durationDays = body.durationDays === null ? null : Number(body.durationDays);
  if (body.isArchived !== undefined) data.isArchived = body.isArchived;

  // 是否需要串聯重算
  const scheduleChanged = ['durationDays', 'plannedStart', 'plannedEnd'].some((k) => k in body);

  // 更新本身
  let updated = await prisma.project.update({
    where: { id }, data, include: PROJECT_INCLUDE,
  });

  if (scheduleChanged) {
    await cascadeSchedule(updated);
    updated = await prisma.project.findUnique({ where: { id }, include: PROJECT_INCLUDE });
  }

  return NextResponse.json(serializeProject(updated));
}

export async function DELETE(_req, { params }) {
  const id = Number(params.id);
  const p = await prisma.project.findUnique({ where: { id } });
  if (!p) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (!p.isCustom) {
    return NextResponse.json({ error: 'baseline projects cannot be deleted; archive instead' }, { status: 403 });
  }
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

/**
 * 以 anchor 項目為起點，重新計算本項目結束日，並串聯安排後面所有項目的 plannedStart / plannedEnd
 * 規則：不動 anchor 之前的項目。anchor 本身的 plannedEnd = plannedStart + durationDays - 1 工作日。
 */
async function cascadeSchedule(anchor) {
  // 取全域預設
  const sett = await prisma.setting.findUnique({ where: { key: 'schedule.defaultDurationDays' } });
  const defaultDuration = Number(sett?.value || 20);

  if (!anchor.plannedStart) return; // 未設起始日不能串聯

  const anchorDur = anchor.durationDays || defaultDuration;
  const anchorStart = parseDateUtc(anchor.plannedStart);
  const anchorEnd = addWorkingDays(anchorStart, anchorDur - 1);

  const txn = [];
  // 如果 anchor 的 plannedEnd 與計算出來不同，同步更新
  if (!anchor.plannedEnd || parseDateUtc(anchor.plannedEnd).getTime() !== anchorEnd.getTime()) {
    txn.push(prisma.project.update({ where: { id: anchor.id }, data: { plannedEnd: anchorEnd } }));
  }

  // 取後續項目
  const subsequent = await prisma.project.findMany({
    where: { sortOrder: { gt: anchor.sortOrder }, isArchived: false },
    select: { id: true, durationDays: true, sortOrder: true },
    orderBy: { sortOrder: 'asc' },
  });

  let cursor = addWorkingDays(anchorEnd, 1);
  for (const p of subsequent) {
    const dur = p.durationDays || defaultDuration;
    const start = new Date(cursor.getTime());
    const end = addWorkingDays(start, dur - 1);
    txn.push(prisma.project.update({
      where: { id: p.id },
      data: { plannedStart: start, plannedEnd: end },
    }));
    cursor = addWorkingDays(end, 1);
  }

  if (txn.length > 0) await prisma.$transaction(txn);
}
