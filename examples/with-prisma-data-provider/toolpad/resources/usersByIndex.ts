/**
 * Toolpad data provider file.
 * See: https://mui.com/toolpad/concepts/data-providers/
 */

import { createDataProvider } from '@mui/toolpad/server';
import { PrismaClient } from '@prisma/client';

// Reuse existing PrismaClient instance during development
globalThis.__prisma ??= new PrismaClient();
const prisma: PrismaClient = globalThis.__prisma;

export default createDataProvider({
  async getRecords({ paginationModel: { start, pageSize } }) {
    const [userRecords, totalCount] = await Promise.all([
      prisma.user.findMany({
        skip: start,
        take: pageSize,
      }),
      prisma.user.count(),
    ]);
    return {
      records: userRecords,
      totalCount,
    };
  },
});
