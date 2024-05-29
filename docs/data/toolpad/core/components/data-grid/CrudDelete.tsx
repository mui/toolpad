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
  async deleteOne(id) {
    DATA = DATA.filter((item) => item.id !== id);
  },
  // preview-end
  fields: {
    id: { label: 'ID' },
    name: { label: 'Name' },
  },
});

export default function CrudDelete() {
  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid height={250} dataProvider={myData} />
    </Box>
  );
}
