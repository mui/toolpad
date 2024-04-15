import { createDataProvider } from '@toolpad/studio/server';

const DATA = Array.from({ length: 100_000 }, (_, id) => ({ id, name: `Index item ${id}` }));

export default createDataProvider({
  async getRecords({ paginationModel: { start = 0, pageSize } }) {
    const records = DATA.slice(start, start + pageSize);
    return { records, totalCount: DATA.length };
  },
});
