import { PrismaClient, Prisma } from '@prisma/client';

// Reuse existing PrismaClient instance during development
(globalThis as any).__prisma ??= new PrismaClient();
const prisma = (globalThis as any).__prisma;

export async function getUsers() {
  return prisma.user.findMany();
}

export async function addUser(user: Prisma.UserCreateInput) {
  return prisma.user.create({ data: user });
}

export async function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}
