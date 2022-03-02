import {
  DataGridProProps,
  DataGridPro,
  GridToolbar,
  LicenseInfo,
  GridColumnResizeParams,
  GridColumns,
  GridRowsProp,
  GridColumnOrderChangeParams,
} from '@mui/x-data-grid-pro';
import * as React from 'react';
import { useStudioNode } from '@mui/studio-core';
import { debounce } from '@mui/material';
import { UseDataQuery } from 'packages/studio-core/dist/useDataQuery';

const LICENSE = window?.document
  .querySelector('meta[name=x-data-grid-pro-license]')
  ?.getAttribute('content');

if (LICENSE) {
  LicenseInfo.setLicenseKey(LICENSE);
}

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

  const handleColumnOrderChange = React.useMemo(
    () =>
      debounce((params: GridColumnOrderChangeParams) => {
        if (!studioNode) {
          return;
        }

        studioNode.setProp('columns', (columns) => {
          const old = columns.find((colDef) => colDef.field === params.field);
          if (!old) {
            return columns;
          }
          const withoutOld = columns.filter((column) => column.field !== params.field);
          return [
            ...withoutOld.slice(0, params.targetIndex),
            old,
            ...withoutOld.slice(params.targetIndex),
          ];
        });
      }, 500),
    [studioNode],
  );
  React.useEffect(() => handleColumnOrderChange.clear(), [handleColumnOrderChange]);

  const { rows: dataQueryRows, ...dataQueryRest } = dataQuery || {};

  const columns: GridColumns = columnsProp || EMPTY_COLUMNS;

  const rows: GridRowsProp = rowsProp || dataQueryRows || EMPTY_ROWS;

  return (
    <div ref={ref} style={{ height: 350, width: '100%' }}>
      <DataGridPro
        components={{ Toolbar: GridToolbar }}
        onColumnResize={handleResize}
        onColumnOrderChange={handleColumnOrderChange}
        rows={rows}
        columns={columns}
        {...dataQueryRest}
        {...props}
      />
    </div>
  );
});

export default DataGridComponent;
