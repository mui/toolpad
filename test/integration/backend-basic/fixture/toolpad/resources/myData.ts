import { createDataProvider } from '@mui/toolpad-core/server';

const DATA = Array.from({ length: 1000 }, (_, id) => ({ id, name: `Item ${id}` }));

export default createDataProvider({
  async getRecords({ paginationModel: { start = 0, pageSize } }) {
    const records = DATA.slice(start, start + pageSize);
    return { records };
  },
});
