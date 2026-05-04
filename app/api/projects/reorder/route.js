import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/projects/reorder
// body: { ids: ["projectId1", "projectId2", ...] }
// 依陣列順序 1, 2, 3... 設定 sortOrder。
// 僅更新有傳進來的 id（支援部分排序，例：只排序「管理部」兩項不會影響其他部門）
export async function POST(request) {
  const body = await request.json();
  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: 'ids array required' }, { status: 400 });
  }

  // 取得這些項目目前的 sortOrder 範圍
  const numericIds = body.ids.map((s) => Number(s));
  const existing = await prisma.project.findMany({
    where: { id: { in: numericIds } },
    select: { id: true, sortOrder: true },
  });
  const existingSorts = existing.map((p) => p.sortOrder).sort((a, b) => a - b);

  // 確保排序權重不會有重複值（若原本都是 0，就遞增拉開差距）
  for (let i = 1; i < existingSorts.length; i++) {
    if (existingSorts[i] <= existingSorts[i - 1]) {
      existingSorts[i] = existingSorts[i - 1] + 10;
    }
  }

  // 把 existing 的 sortOrder 重新分配給新順序
  const updates = numericIds.map((id, idx) => {
    const newSort = existingSorts[idx] ?? (idx * 10);
    return prisma.project.update({
      where: { id },
      data: { sortOrder: newSort },
    });
  });
  await prisma.$transaction(updates);
  return NextResponse.json({ ok: true, reordered: numericIds.length });
}
