import { createDataProvider } from '@mui/toolpad/server';

let nextId = 0;
function createRecord(values = {}) {
  const id = nextId;
  nextId += 1;
  return { name: `Index item ${id}`, ...values, id };
}
let DATA = Array.from({ length: 100_000 }, () => createRecord());

type DataRecord = (typeof DATA)[number];

export default createDataProvider<DataRecord>({
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

  async createRecord(values) {
    const newRecord = createRecord(values);
    DATA = [...DATA, newRecord];
    return newRecord;
  },
});
