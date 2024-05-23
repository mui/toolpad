import * as React from 'react';
import { CacheProvider, createDataProvider } from '@toolpad/core/DataProvider';
import { DataGrid } from '@toolpad/core/DataGrid';
import Box from '@mui/material/Box';
import { DialogProvider } from '@toolpad/core/useDialogs';

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
    <DialogProvider>
      <CacheProvider>
        <Box sx={{ height: 250, width: '100%' }}>
          <DataGrid dataProvider={myData} />
        </Box>
      </CacheProvider>
    </DialogProvider>
  );
}
