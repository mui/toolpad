import * as React from 'react';
import { createDataProvider } from '@toolpad/core/DataProvider';
import { DataGrid } from '@toolpad/core/DataGrid';
import Box from '@mui/material/Box';

let nextId = 1;
const getNextId = () => {
  const id = `id-${nextId}`;
  nextId += 1;
  return id;
};
let DATA = [
  { id: getNextId(), name: 'John' },
  { id: getNextId(), name: 'Jane' },
];

const myData = createDataProvider({
  async getMany() {
    return {
      rows: DATA,
    };
  },
  // preview-start
  async updateOne(id, values) {
    console.log(id, values);
    const existing = DATA.find((item) => item.id === id);
    if (!existing) {
      throw new Error(`Item with id ${id} not found`);
    }
    const updated = { ...existing, ...values };
    DATA = DATA.map((item) => (item.id === updated.id ? updated : item));
    return updated;
  },
  // preview-end
  fields: {
    id: { label: 'ID' },
    name: { label: 'Name' },
  },
});

export default function CrudUpdate() {
  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid height={250} dataProvider={myData} />
    </Box>
  );
}
