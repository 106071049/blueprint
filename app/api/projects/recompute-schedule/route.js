import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeSchedule } from '@/lib/workdays';

// POST /api/projects/recompute-schedule
// body: {
//   startDate?: 'YYYY-MM-DD',     // 可選，預設從 settings 讀
//   defaultDuration?: number,      // 可選
//   onlyActive?: boolean,          // true = 只重算進行中/規劃中（已完成不動）
// }
export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  const settingRows = await prisma.setting.findMany({
    where: { key: { in: ['schedule.globalStartDate', 'schedule.defaultDurationDays'] } },
  });
  const sett = Object.fromEntries(settingRows.map((r) => [r.key, r.value]));
  const startDate = body.startDate || sett['schedule.globalStartDate'] || '2026-04-27';
  const defaultDuration = Number(body.defaultDuration ?? sett['schedule.defaultDurationDays'] ?? 20);

  const allProjects = await prisma.project.findMany({
    where: body.onlyActive ? { status: { in: ['planning', 'in_progress'] }, isArchived: false } : { isArchived: false },
    select: { id: true, sortOrder: true, durationDays: true, status: true },
    orderBy: { sortOrder: 'asc' },
  });

  const computed = computeSchedule(allProjects, startDate, defaultDuration);

  const updates = computed.map((c) =>
    prisma.project.update({
      where: { id: c.id },
      data: {
        plannedStart: new Date(c.plannedStart),
        plannedEnd: new Date(c.plannedEnd),
      },
    })
  );
  await prisma.$transaction(updates);

  return NextResponse.json({
    ok: true,
    updated: computed.length,
    startDate,
    defaultDuration,
  });
}
