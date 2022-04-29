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
import { useNode, UseDataQuery, createComponent } from '@mui/toolpad-core';
import { debounce } from '@mui/material';

function inferColumnType(value: unknown): string | undefined {
  if (value instanceof Date) {
    return 'dateTime';
  }
  const valueType = typeof value;
  switch (typeof value) {
    case 'number':
    case 'boolean':
    case 'string':
      return valueType;
    default:
      return undefined;
  }
}

export function inferColumns(rows: GridRowsProp): GridColumns {
  if (rows.length < 1) {
    return [];
  }
  // Naive implementation that checks only the first row
  const firstRow = rows[0];
  return Object.entries(firstRow).map(([field, value]) => ({
    field,
    type: inferColumnType(value),
  }));
}

const LICENSE =
  typeof window !== 'undefined'
    ? window.document.querySelector('meta[name=x-data-grid-pro-license]')?.getAttribute('content')
    : null;

if (LICENSE) {
  LicenseInfo.setLicenseKey(LICENSE);
}

const EMPTY_COLUMNS: GridColumns = [];
const EMPTY_ROWS: GridRowsProp = [];

interface ToolpadDataGridProps extends Omit<DataGridProProps, 'columns' | 'rows'> {
  rows?: GridRowsProp;
  columns?: GridColumns;
  rowIdField?: string;
  dataQuery?: UseDataQuery;
  selection: any;
  onSelectionChange: (newSelection: any) => void;
}

const DataGridComponent = React.forwardRef(function DataGridComponent(
  {
    dataQuery,
    columns: columnsProp,
    rows: rowsProp,
    selection,
    onSelectionChange,
    ...props
  }: ToolpadDataGridProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const nodeRuntime = useNode<ToolpadDataGridProps>();

  const handleResize = React.useMemo(
    () =>
      debounce((params: GridColumnResizeParams) => {
        if (!nodeRuntime) {
          return;
        }

        nodeRuntime.setProp('columns', (columns) =>
          columns?.map((column) =>
            column.field === params.colDef.field ? { ...column, width: params.width } : column,
          ),
        );
      }, 500),
    [nodeRuntime],
  );
  React.useEffect(() => handleResize.clear(), [handleResize]);

  const handleColumnOrderChange = React.useMemo(
    () =>
      debounce((params: GridColumnOrderChangeParams) => {
        if (!nodeRuntime) {
          return;
        }

        nodeRuntime.setProp('columns', (columns) => {
          if (!columns) {
            return columns;
          }
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
    [nodeRuntime],
  );
  React.useEffect(() => handleColumnOrderChange.clear(), [handleColumnOrderChange]);

  const { rows: dataQueryRows, ...dataQueryRest } = dataQuery || {};

  const rows: GridRowsProp = rowsProp || dataQueryRows || EMPTY_ROWS;

  const columnsInitRef = React.useRef(false);
  const hasColumnsDefined = columnsProp && columnsProp.length > 0;
  React.useEffect(() => {
    if (!nodeRuntime || hasColumnsDefined || rows.length <= 0 || columnsInitRef.current) {
      return;
    }

    const inferredColumns = inferColumns(rows);

    nodeRuntime.setProp('columns', inferredColumns);

    columnsInitRef.current = true;
  }, [hasColumnsDefined, rows, nodeRuntime]);

  const columns: GridColumns = columnsProp || EMPTY_COLUMNS;

  return (
    <div ref={ref} style={{ height: 350, width: '100%' }}>
      <DataGridPro
        components={{ Toolbar: GridToolbar }}
        onColumnResize={handleResize}
        onColumnOrderChange={handleColumnOrderChange}
        rows={rows}
        columns={columns}
        onSelectionModelChange={(ids) =>
          onSelectionChange(ids.length > 0 ? rows.find((row) => row.id === ids[0]) : null)
        }
        selectionModel={selection ? [selection.id] : []}
        {...dataQueryRest}
        {...props}
      />
    </div>
  );
});

DataGridComponent.defaultProps = {
  selection: null,
};

export default createComponent(DataGridComponent, {
  argTypes: {
    rows: {
      typeDef: { type: 'array', schema: '/schemas/DataGridRows.json' },
    },
    columns: {
      typeDef: { type: 'array', schema: '/schemas/DataGridColumns.json' },
      control: { type: 'GridColumns' },
      memoize: true,
    },
    dataQuery: {
      typeDef: { type: 'object', schema: '/schemas/DataQuery.json' },
    },
    density: {
      typeDef: { type: 'string', enum: ['compact', 'standard', 'comfortable'] },
    },
    sx: {
      typeDef: { type: 'object' },
    },
    selection: {
      typeDef: { type: 'object' },
      onChangeProp: 'onSelectionChange',
    },
  },
});
