import { PrismaClient } from '@prisma/client';

/** Shared Prisma client instance. */
export const prisma = new PrismaClient();

export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}
