import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeProject, statusFromZh, parseDate } from '../../_serialize';

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

  const updated = await prisma.project.update({
    where: { id }, data, include: PROJECT_INCLUDE,
  });

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

