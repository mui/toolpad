import { PrismaClient, Prisma } from '@prisma/client';

// Reuse existing PrismaClient instance during development
(globalThis as any).__prisma ??= new PrismaClient();
const prisma: PrismaClient = (globalThis as any).__prisma;

export default prisma;

export { Prisma };
