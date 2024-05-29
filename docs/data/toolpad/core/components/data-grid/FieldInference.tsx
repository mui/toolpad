import * as React from 'react';
import { createDataProvider } from '@toolpad/core/DataProvider';
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

export default function FieldInference() {
  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid height={300} dataProvider={myData} />
    </Box>
  );
}
