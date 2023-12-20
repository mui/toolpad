import { createDataProvider } from '@mui/toolpad/server';

let DATA = Array.from({ length: 100_000 }, (_, id) => ({ id, name: `Index item ${id}` }));

export default createDataProvider({
  async getRecords({ paginationModel: { start = 0, pageSize } }) {
    const records = DATA.slice(start, start + pageSize);
    return { records, totalCount: DATA.length };
  },

  async deleteRecord(id) {
    DATA = DATA.filter((item) => item.id !== id);
  },

  async updateRecord(id, updates) {
    DATA = DATA.map((item) => (item.id === id ? { ...item, ...updates } : item));
  },
});
