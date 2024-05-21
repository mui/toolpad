import * as React from 'react';
import { CacheProvider, createDataProvider } from '@toolpad/core/DataProvider';
import { DataGrid } from '@toolpad/core/DataGrid';
import Box from '@mui/material/Box';

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
    <CacheProvider>
      <Box sx={{ height: 300, width: '100%' }}>
        {/* preview-start */}
        <DataGrid dataProvider={myData} />
        {/* preview-end */}
      </Box>
    </CacheProvider>
  );
}
