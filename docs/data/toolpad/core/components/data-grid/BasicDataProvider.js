import * as React from 'react';
import { createDataProvider } from '@toolpad/core/DataProvider';
import { DataGrid } from '@toolpad/core/DataGrid';
import Box from '@mui/material/Box';

const myData = createDataProvider({
  // preview-start
  async getMany() {
    return {
      rows: [
        { id: '1', name: 'John' },
        { id: '2', name: 'Jane' },
      ],
    };
  },
  // preview-end
  fields: {
    id: { label: 'ID' },
    name: { label: 'Name' },
  },
});

export default function BasicDataProvider() {
  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid height={250} dataProvider={myData} />
    </Box>
  );
}
