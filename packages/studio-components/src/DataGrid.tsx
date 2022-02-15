import {
  DataGridProProps,
  DataGridPro,
  GridToolbar,
  LicenseInfo,
  GridColumnResizeParams,
  GridColumns,
  GridRowsProp,
} from '@mui/x-data-grid-pro';
import * as React from 'react';
import { useStudioNode } from '@mui/studio-core';
import { debounce } from '@mui/material';
import { UseDataQuery } from 'packages/studio-core/dist/useDataQuery';

// TODO: Generate a specific license for Studio (This one comes from CI)
const LICENSE = '<REDACTED>';

LicenseInfo.setLicenseKey(LICENSE);

const EMPTY_COLUMNS: GridColumns = [];
const EMPTY_ROWS: GridRowsProp = [];

interface DataGridWithQueryProps extends Omit<DataGridProProps, 'columns' | 'rows'> {
  rows?: GridRowsProp;
  columns?: GridColumns;
  dataQuery?: UseDataQuery;
}

const DataGridComponent = React.forwardRef(function DataGridComponent(
  { dataQuery, columns: columnsProp, rows: rowsProp, ...props }: DataGridWithQueryProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const studioNode = useStudioNode<DataGridProProps>();

  const handleResize = React.useMemo(
    () =>
      debounce((params: GridColumnResizeParams) => {
        if (!studioNode) {
          return;
        }

        studioNode.setProp('columns', (columns) =>
          columns.map((column) =>
            column.field === params.colDef.field ? { ...column, width: params.width } : column,
          ),
        );
      }, 500),
    [studioNode],
  );
  React.useEffect(() => handleResize.clear(), [handleResize]);

  const { columns: dataQueryColumns, rows: dataQueryRows, ...dataQueryRest } = dataQuery || {};

  const columns: GridColumns = columnsProp || dataQueryColumns || EMPTY_COLUMNS;

  const rows: GridRowsProp = rowsProp || dataQueryRows || EMPTY_ROWS;

  return (
    <div ref={ref} style={{ height: 350, width: '100%' }}>
      <DataGridPro
        components={{ Toolbar: GridToolbar }}
        onColumnResize={handleResize}
        rows={rows}
        columns={columns}
        {...dataQueryRest}
        {...props}
      />
    </div>
  );
});

export default DataGridComponent;
