import {
  DataGridProProps,
  DataGridPro,
  GridToolbar,
  LicenseInfo,
  GridColumnResizeParams,
  GridCallbackDetails,
  MuiEvent,
} from '@mui/x-data-grid-pro';
import * as React from 'react';
import { createComponent, useStudioNode } from '@mui/studio-core';
import { debounce } from '@mui/material';

// TODO: Generate a specific license for Studio (This one comes from CI)
const LICENSE = '<REDACTED>';

LicenseInfo.setLicenseKey(LICENSE);

interface DataGridWithQueryProps extends DataGridProProps {
  studioDataQuery: string | null;
}

const DataGridComponent = React.forwardRef(function DataGridComponent(
  props: DataGridWithQueryProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const studioNode = useStudioNode<DataGridProProps>();

  const handleResize = React.useMemo(
    () =>
      debounce((params: GridColumnResizeParams, event: MuiEvent, details: GridCallbackDetails) => {
        if (!studioNode) {
          return;
        }

        studioNode.setProp('columns', (columns) => columns);
      }, 500),
    [studioNode],
  );

  return (
    <div ref={ref} style={{ height: 350, width: '100%' }}>
      <DataGridPro components={{ Toolbar: GridToolbar }} onColumnResize={handleResize} {...props} />
    </div>
  );
});

export default createComponent(DataGridComponent, {
  argTypes: {
    rows: {
      typeDef: { type: 'array', items: { type: 'object' } },
      defaultValue: [],
    },
    columns: {
      typeDef: { type: 'array', items: { type: 'object' } },
      defaultValue: [],
    },
    density: {
      typeDef: { type: 'string', enum: ['comfortable', 'compact', 'standard'] },
    },
    studioDataQuery: {
      typeDef: { type: 'dataQuery' },
    },
  },
});
