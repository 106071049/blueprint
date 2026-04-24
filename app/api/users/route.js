import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
    select: {
      id: true, email: true, displayName: true, title: true,
      role: true, departmentId: true,
      _count: { select: { ownedProjects: true } },
    },
  });
  return NextResponse.json(
    users.map((u) => ({
      id: String(u.id),
      email: u.email,
      name: u.displayName,
      title: u.title || '',
      role: u.role,
      departmentId: u.departmentId,
      ownedCount: u._count.ownedProjects,
    }))
  );
}

export async function POST(request) {
  const body = await request.json();
  if (!body.email || !body.displayName) {
    return NextResponse.json({ error: 'email and displayName required' }, { status: 400 });
  }
  const user = await prisma.user.upsert({
    where: { email: body.email },
    update: { displayName: body.displayName, title: body.title, role: body.role || 'editor' },
    create: {
      email: body.email,
      displayName: body.displayName,
      title: body.title || null,
      role: body.role || 'editor',
    },
  });
  return NextResponse.json({
    id: String(user.id),
    email: user.email,
    name: user.displayName,
    title: user.title || '',
    role: user.role,
  }, { status: 201 });
}
