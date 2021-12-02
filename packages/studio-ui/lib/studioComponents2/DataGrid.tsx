import { DataGridProps, DataGrid } from '@mui/x-data-grid';
import * as React from 'react';
import { createComponent } from '@mui/studio-core';

interface DataGridWithQueryProps extends DataGridProps {
  studioDataQuery: string | null;
}

function DataGridComponent({ studioDataQuery, ...props }: DataGridWithQueryProps) {
  console.log(`TDO: handle query ${studioDataQuery}`);
  return (
    <div style={{ height: 350, width: '100%' }}>
      <DataGrid {...props} />
    </div>
  );
}

export default createComponent(DataGridComponent, {
  props: {
    rows: { type: 'DataGridRows', defaultValue: [] },
    columns: {
      type: 'DataGridColumns',
      defaultValue: [],
    },
    studioDataQuery: {
      type: 'DataQuery',
      defaultValue: null,
    },
  },
});
