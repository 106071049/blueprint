import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeSubtask, parseDate } from '../../../_serialize';

export async function POST(req, { params }) {
  const projectId = Number(params.id);
  const body = await req.json();
  if (!body.title || !body.title.trim()) {
    return NextResponse.json({ error: 'title required' }, { status: 400 });
  }
  const count = await prisma.subtask.count({ where: { projectId } });
  const st = await prisma.subtask.create({
    data: {
      projectId,
      title: body.title.trim(),
      dueDate: parseDate(body.dueDate),
      sortOrder: count + 1,
    },
  });
  return NextResponse.json(serializeSubtask(st), { status: 201 });
}

export async function GET(_req, { params }) {
  const projectId = Number(params.id);
  const subs = await prisma.subtask.findMany({
    where: { projectId },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(subs.map(serializeSubtask));
}
