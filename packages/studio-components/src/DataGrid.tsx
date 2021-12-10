import { DataGridProps, DataGrid } from '@mui/x-data-grid';
import * as React from 'react';
import { createComponent } from '@mui/studio-core';

interface DataGridWithQueryProps extends DataGridProps {
  studioDataQuery: string | null;
}

const DataGridComponent = React.forwardRef(function DataGridComponent(
  props: DataGridWithQueryProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div ref={ref} style={{ height: 350, width: '100%' }}>
      <DataGrid {...props} />
    </div>
  );
});

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
