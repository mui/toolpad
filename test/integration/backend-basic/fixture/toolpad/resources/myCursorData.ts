import { createDataProvider } from '@toolpad/studio/server';

const DATA = Array.from({ length: 1_000 }, (_, id) => ({ id, name: `Cursor item ${id}` }));

export default createDataProvider({
  paginationMode: 'cursor',
  async getRecords({ paginationModel: { cursor, pageSize } }) {
    const start = cursor ? Number(cursor) : 0;
    const end = start + pageSize;
    const records = DATA.slice(start, end);
    const nextCursor = DATA.length > end ? String(end) : null;
    return { records, totalCount: DATA.length, cursor: nextCursor };
  },
});
