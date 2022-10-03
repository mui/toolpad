import {
  DataGridProProps,
  DataGridPro,
  GridToolbar,
  GridColumnResizeParams,
  GridColumns,
  GridRowsProp,
  GridColumnOrderChangeParams,
  useGridApiContext,
  gridColumnsTotalWidthSelector,
  gridColumnPositionsSelector,
  gridDensityRowHeightSelector,
  GridSelectionModel,
  GridValueFormatterParams,
  GridColDef,
  GridValueGetterParams,
  useGridApiRef,
} from '@mui/x-data-grid-pro';
import * as React from 'react';
import { useNode, createComponent } from '@mui/toolpad-core';
import { Box, debounce, LinearProgress, Skeleton, styled } from '@mui/material';
import { getObjectKey } from '@mui/toolpad-core/objectKey';

// Pseudo random number. See https://stackoverflow.com/a/47593316
function mulberry32(a: number): () => number {
  return () => {
    /* eslint-disable */
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    /* eslint-enable */
  };
}

function randomBetween(seed: number, min: number, max: number): () => number {
  const random = mulberry32(seed);
  return () => min + (max - min) * random();
}

const SkeletonCell = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

function SkeletonLoadingOverlay() {
  const apiRef = useGridApiContext();

  const dimensions = apiRef.current?.getRootDimensions();
  const viewportHeight = dimensions?.viewportInnerSize.height ?? 0;

  const rowHeight = gridDensityRowHeightSelector(apiRef);
  const skeletonRowsCount = Math.ceil(viewportHeight / rowHeight);

  const totalWidth = gridColumnsTotalWidthSelector(apiRef);
  const positions = gridColumnPositionsSelector(apiRef);
  const inViewportCount = React.useMemo(
    () => positions.filter((value) => value <= totalWidth).length,
    [totalWidth, positions],
  );
  const columns = apiRef.current.getVisibleColumns().slice(0, inViewportCount);

  const children = React.useMemo(() => {
    // reseed random number generator to create stable lines betwen renders
    const random = randomBetween(12345, 25, 75);
    const array: React.ReactNode[] = [];

    for (let i = 0; i < skeletonRowsCount; i += 1) {
      for (const column of columns) {
        const width = Math.round(random());
        array.push(
          <SkeletonCell key={`col-${column.field}-${i}`} sx={{ justifyContent: column.align }}>
            <Skeleton sx={{ mx: 1 }} width={`${width}%`} />
          </SkeletonCell>,
        );
      }
      array.push(<SkeletonCell key={`fill-${i}`} />);
    }
    return array;
  }, [skeletonRowsCount, columns]);

  const rowsCount = apiRef.current.getRowsCount();

  return rowsCount > 0 ? (
    <LinearProgress />
  ) : (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `${columns
          .map(({ computedWidth }) => `${computedWidth}px`)
          .join(' ')} 1fr`,
        gridAutoRows: `${rowHeight}px`,
      }}
    >
      {children}
    </div>
  );
}

function inferColumnType(value: unknown): string {
  if (value instanceof Date) {
    return 'dateTime';
  }
  const valueType = typeof value;
  switch (typeof value) {
    case 'number':
    case 'boolean':
    case 'string':
      return valueType;
    case 'object':
      return 'json';
    default:
      return 'string';
  }
}

const DEFAULT_TYPES = new Set([
  'string',
  'number',
  'date',
  'dateTime',
  'boolean',
  'singleSelect',
  'actions',
]);

function dateValueGetter({ value }: GridValueGetterParams<any, any>) {
  return typeof value === 'number' ? new Date(value) : value;
}

const COLUMN_TYPES: Record<string, Omit<GridColDef, 'field'>> = {
  json: {
    valueFormatter: ({ value: cellValue }: GridValueFormatterParams) => JSON.stringify(cellValue),
  },
  date: {
    valueGetter: dateValueGetter,
  },
  dateTime: {
    valueGetter: dateValueGetter,
  },
};

export type SerializableGridColumns = { field: string; type: string }[];

export function inferColumns(rows: GridRowsProp): SerializableGridColumns {
  if (rows.length < 1) {
    return [];
  }
  // Naive implementation that checks only the first row
  const firstRow = rows[0];
  return Object.entries(firstRow).map(([field, value]) => {
    return {
      field,
      headerName:
        // turn field into a human readable name by capitalizing the first letter and replacing camel case with spaces
        field[0].toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
      // Add minimum width to the columns
      width: 150,
      type: inferColumnType(value),
    };
  });
}

export function parseColumns(columns: SerializableGridColumns): GridColumns {
  return columns.map(({ type, ...column }) => ({
    type: DEFAULT_TYPES.has(type) ? type : undefined,
    ...column,
    ...COLUMN_TYPES[type],
  }));
}

const DEFAULT_COLUMNS: (Omit<GridColDef, 'type'> & { type: string })[] = [
  { field: 'id', headerName: 'ID', type: 'number', width: 90 },
  {
    field: 'firstName',
    headerName: 'First name',
    type: 'string',
    width: 150,
    editable: true,
  },
  {
    field: 'lastName',
    headerName: 'Last name',
    type: 'string',
    width: 150,
    editable: true,
  },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 110,
    editable: true,
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    type: 'string',
    sortable: false,
    width: 160,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.firstName || ''} ${params.row.lastName || ''}`,
  },
];

const DEFAULT_ROWS: GridRowsProp = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

const EMPTY_ROWS: GridRowsProp = [];

interface Selection {
  id?: any;
}

interface ToolpadDataGridProps extends Omit<DataGridProProps, 'columns' | 'rows' | 'error'> {
  rows?: GridRowsProp;
  columns?: SerializableGridColumns;
  height?: number;
  rowIdField?: string;
  error?: Error | string;
  selection?: Selection | null;
  onSelectionChange?: (newSelection?: Selection | null) => void;
}

const DataGridComponent = React.forwardRef(function DataGridComponent(
  {
    columns: columnsProp,
    rows: rowsProp,
    height: heightProp,
    rowIdField: rowIdFieldProp,
    error: errorProp,
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

        nodeRuntime.updateAppDomConstProp('columns', (columns) =>
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

        nodeRuntime.updateAppDomConstProp('columns', (columns) => {
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

  const rowsInput = rowsProp || EMPTY_ROWS;

  const hasExplicitRowId: boolean = React.useMemo(() => {
    const hasRowIdField: boolean = !!(rowIdFieldProp && rowIdFieldProp !== 'id');
    return rowsInput.length === 0 || hasRowIdField || !!rowsInput[0].id;
  }, [rowIdFieldProp, rowsInput]);

  const rows: GridRowsProp = React.useMemo(
    () => (hasExplicitRowId ? rowsInput : rowsInput.map((row, id) => ({ ...row, id }))),
    [hasExplicitRowId, rowsInput],
  );

  const columnsInitRef = React.useRef(false);
  const isUsingDefaultData = rows === DEFAULT_ROWS;
  const columns: GridColumns = React.useMemo(
    () => (columnsProp ? parseColumns(columnsProp) : DEFAULT_COLUMNS),
    [columnsProp],
  );

  React.useEffect(() => {
    if (!nodeRuntime || isUsingDefaultData || rows.length <= 0 || columnsInitRef.current) {
      return;
    }

    let inferredColumns = inferColumns(rows);

    if (!hasExplicitRowId) {
      inferredColumns = inferredColumns.filter((column) => column.field !== 'id');
    }

    nodeRuntime.updateAppDomConstProp('columns', inferredColumns);

    columnsInitRef.current = true;
  }, [isUsingDefaultData, rows, nodeRuntime, hasExplicitRowId]);

  const getRowId = React.useCallback(
    (row: any) => {
      return rowIdFieldProp && row[rowIdFieldProp] ? row[rowIdFieldProp] : row.id;
    },
    [rowIdFieldProp],
  );

  const onSelectionModelChange = React.useCallback(
    (ids: GridSelectionModel) => {
      onSelectionChange?.(ids.length > 0 ? rows.find((row) => row.id === ids[0]) : null);
    },
    [rows, onSelectionChange],
  );

  const selectionModel = React.useMemo(
    () => (selection?.id ? [selection.id] : []),
    [selection?.id],
  );

  const apiRef = useGridApiRef();
  React.useEffect(() => apiRef.current.updateColumns(columns), [apiRef, columns]);

  // The grid doesn't update when the getRowId or columns properties change, so it needs to be remounted
  // TODO: remove columns from this equation once https://github.com/mui/mui-x/issues/5970 gets resolved
  const gridKey = React.useMemo(
    () => [getObjectKey(getRowId), getObjectKey(columns)].join('::'),
    [getRowId, columns],
  );

  return (
    <div
      ref={ref}
      style={{ height: heightProp, minHeight: '100%', width: '100%', colorScheme: 'auto' }}
    >
      <DataGridPro
        apiRef={apiRef}
        components={{ Toolbar: GridToolbar, LoadingOverlay: SkeletonLoadingOverlay }}
        onColumnResize={handleResize}
        onColumnOrderChange={handleColumnOrderChange}
        rows={rows}
        columns={columns}
        key={gridKey}
        getRowId={getRowId}
        onSelectionModelChange={onSelectionModelChange}
        selectionModel={selectionModel}
        error={errorProp}
        componentsProps={{
          errorOverlay: {
            message: typeof errorProp === 'string' ? errorProp : errorProp?.message,
          },
        }}
        {...props}
      />
    </div>
  );
});

export default createComponent(DataGridComponent, {
  errorProp: 'error',
  loadingPropSource: ['rows', 'columns'],
  loadingProp: 'loading',
  resizableHeightProp: 'height',
  argTypes: {
    rows: {
      typeDef: { type: 'array', schema: '/schemas/DataGridRows.json' },
      defaultValue: DEFAULT_ROWS,
    },
    columns: {
      typeDef: { type: 'array', schema: '/schemas/DataGridColumns.json' },
      control: { type: 'GridColumns' },
      defaultValue: DEFAULT_COLUMNS,
    },
    rowIdField: {
      typeDef: { type: 'string' },
      control: { type: 'RowIdFieldSelect' },
      label: 'Id field',
      defaultValue: 'id',
    },
    selection: {
      typeDef: { type: 'object' },
      onChangeProp: 'onSelectionChange',
      defaultValue: null,
    },
    density: {
      typeDef: { type: 'string', enum: ['compact', 'standard', 'comfortable'] },
      defaultValue: 'compact',
    },
    height: {
      typeDef: { type: 'number' },
      defaultValue: 350,
    },
    loading: {
      typeDef: { type: 'boolean' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
