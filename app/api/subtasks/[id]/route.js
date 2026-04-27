import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeSubtask, parseDate } from '../../_serialize';

export async function PATCH(req, { params }) {
  const id = Number(params.id);
  const body = await req.json();
  const data = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.done !== undefined) {
    data.isDone = !!body.done;
    data.completedAt = body.done ? new Date() : null;
  }
  if (body.status !== undefined) {
    const allowed = ['planning', 'in_progress', 'done_v1', 'done'];
    if (allowed.includes(body.status)) {
      data.status = body.status;
      if (body.status === 'done' || body.status === 'done_v1') {
        data.isDone = true; data.completedAt = new Date();
      } else {
        data.isDone = false; data.completedAt = null;
      }
    }
  }
  if (body.dueDate !== undefined) data.dueDate = parseDate(body.dueDate);
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
  if (body.manualProgress !== undefined) {
    data.manualProgress = body.manualProgress === null ? null : Math.min(100, Math.max(0, Number(body.manualProgress)));
  }
  const updated = await prisma.subtask.update({ where: { id }, data });
  return NextResponse.json(serializeSubtask(updated));
}

export async function DELETE(_req, { params }) {
  const id = Number(params.id);
  await prisma.subtask.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
