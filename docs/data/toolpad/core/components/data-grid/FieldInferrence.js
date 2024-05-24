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
  // paste fields here:
});
// preview-end

export default function FieldInferrence() {
  return (
    <CacheProvider>
      <Box sx={{ height: 300, width: '100%' }}>
        <DataGrid dataProvider={myData} />
      </Box>
    </CacheProvider>
  );
}
