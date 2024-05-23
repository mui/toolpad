import * as React from 'react';
import { CacheProvider, createDataProvider } from '@toolpad/core/DataProvider';
import { DataGrid } from '@toolpad/core/DataGrid';
import Box from '@mui/material/Box';
import { DialogProvider } from '@toolpad/core/useDialogs';
import invariant from 'invariant';

const myData = createDataProvider({
  // preview-start
  async getMany({ pagination }) {
    invariant(pagination, 'This data provider requires server-side pagination.');
    return {
      rows: Array.from(new Array(pagination.pageSize), (_, i) => ({
        id: `${pagination.start + i}`,
        item: `Item ${pagination.start + i}`,
        page: Math.floor(pagination.start / pagination.pageSize) + 1,
      })),
      totalCount: 1000000,
    };
  },
  // preview-end
  fields: {
    id: { label: 'ID' },
    item: { label: 'Item' },
    page: { label: 'Page' },
  },
});

export default function ServerSidePagination() {
  return (
    <DialogProvider>
      <CacheProvider>
        <Box sx={{ height: 250, width: '100%' }}>
          <DataGrid paginationMode="server" dataProvider={myData} />
        </Box>
      </CacheProvider>
    </DialogProvider>
  );
}
