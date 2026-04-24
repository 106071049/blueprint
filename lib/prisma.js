import { PrismaClient } from '@prisma/client';

// In dev, Next.js hot-reload creates many instances of Prisma; keep a singleton.
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
