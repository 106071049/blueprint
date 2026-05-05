import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeProject, statusFromZh, parseDate } from '../_serialize';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PROJECT_INCLUDE = {
  department: true,
  subtasks: { orderBy: { sortOrder: 'asc' } },
  owners: { include: { user: true }, orderBy: { assignedAt: 'asc' } },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const deptName = searchParams.get('department');
  const status = searchParams.get('status');

  const where = {};
  if (deptName && deptName !== '全部') where.department = { name: deptName };
  if (status && status !== '全部') where.status = statusFromZh(status);

  const projects = await prisma.project.findMany({
    where,
    include: PROJECT_INCLUDE,
    orderBy: [{ departmentId: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
  });
  return NextResponse.json(projects.map(serializeProject));
}

export async function POST(request) {
  const body = await request.json();
  let departmentId = body.departmentId;
  if (!departmentId && body.department) {
    const dept = await prisma.department.upsert({
      where: { code: slugify(body.department) },
      update: {},
      create: { code: slugify(body.department), name: body.department, sortOrder: 99 },
    });
    departmentId = dept.id;
  }
  if (!body.name || !departmentId) {
    return NextResponse.json({ error: 'name and department required' }, { status: 400 });
  }

  // Auto-assign Louis (IT@wauyuan.com) as owner if exists
  const defaultOwner = await prisma.user.findUnique({ where: { email: 'IT@wauyuan.com' } });

  const created = await prisma.project.create({
    data: {
      name: body.name,
      departmentId,
      status: body.status ? statusFromZh(body.status) : 'planning',
      tag: body.tag || null,
      frequency: body.frequency || null,
      aiDirection: body.aiDirection || null,
      expectedOutput: body.expectedOutput || null,
      logic: body.logic || null,
      isCustom: true,
      plannedStart: parseDate(body.plannedStart),
      plannedEnd: parseDate(body.plannedEnd),
      ...(defaultOwner ? {
        owners: { create: [{ userId: defaultOwner.id, roleInProject: 'owner' }] }
      } : {}),
    },
    include: PROJECT_INCLUDE,
  });
  return NextResponse.json(serializeProject(created), { status: 201 });
}

function slugify(s) {
  return 'dept-' + Buffer.from(s).toString('base64').replace(/[=+/]/g, '').slice(0, 20).toLowerCase();
}
