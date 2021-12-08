import { DataGridProps, DataGrid } from '@mui/x-data-grid';
import * as React from 'react';
import { createComponent } from '@mui/studio-core';

interface DataGridWithQueryProps extends DataGridProps {
  studioDataQuery: string | null;
}

function DataGridComponent(props: DataGridWithQueryProps) {
  // TODO: we need to find a solution for this:
  const studioId: string = (props as any)['data-studio-id'];
  delete (props as any)['data-studio-id'];

  return (
    <div {...{ 'data-studio-id': studioId }} style={{ height: 350, width: '100%' }}>
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
