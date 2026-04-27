import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULTS = {
  'schedule.globalStartDate': '2026-04-27',
  'schedule.defaultDurationDays': '20',
};

export async function GET() {
  const rows = await prisma.setting.findMany();
  const obj = { ...DEFAULTS };
  rows.forEach((r) => { obj[r.key] = r.value; });
  return NextResponse.json(obj);
}

export async function PUT(request) {
  const body = await request.json();
  const updates = [];
  for (const [key, value] of Object.entries(body)) {
    updates.push(prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    }));
  }
  await prisma.$transaction(updates);
  return NextResponse.json({ ok: true, updated: updates.length });
}
