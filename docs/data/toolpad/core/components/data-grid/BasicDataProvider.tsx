import * as React from 'react';
// TODO: replace DialogProvider/CacheProvider with AppProvider
// import { AppProvider } from '@toolpad/core/AppProvider';
import { CacheProvider, createDataProvider } from '@toolpad/core/DataProvider';
import { DataGrid } from '@toolpad/core/DataGrid';
import Box from '@mui/material/Box';
import { DialogProvider } from '@toolpad/core/useDialogs';

// preview-start
const myData = createDataProvider({
  async getMany() {
    return {
      rows: [
        { id: '1', name: 'John' },
        { id: '2', name: 'Jane' },
      ],
    };
  },
  fields: {
    id: { label: 'ID' },
    name: { label: 'Name' },
  },
});
// preview-end

export default function BasicDataProvider() {
  return (
    <DialogProvider>
      <CacheProvider>
        <Box sx={{ height: 300, width: '100%' }}>
          <DataGrid dataProvider={myData} />
        </Box>
      </CacheProvider>
    </DialogProvider>
  );
}
