import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const depts = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { _count: { select: { projects: true } } },
  });
  return NextResponse.json(
    depts.map((d) => ({
      id: d.id,
      code: d.code,
      name: d.name,
      projectCount: d._count.projects,
    }))
  );
}

export async function POST(request) {
  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const code = body.code || 'dept-' + Date.now();
  const dept = await prisma.department.create({
    data: { code, name: body.name, sortOrder: body.sortOrder || 99 },
  });
  return NextResponse.json(dept, { status: 201 });
}
