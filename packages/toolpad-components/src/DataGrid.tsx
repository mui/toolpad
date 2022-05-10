import {
  DataGridProProps,
  DataGridPro,
  GridToolbar,
  LicenseInfo,
  GridColumnResizeParams,
  GridColumns,
  GridRowsProp,
  GridColumnOrderChangeParams,
  useGridApiContext,
  gridColumnsTotalWidthSelector,
  gridColumnPositionsSelector,
} from '@mui/x-data-grid-pro';
import * as React from 'react';
import { useNode, createComponent } from '@mui/toolpad-core';
import { debounce, Skeleton } from '@mui/material';

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

function SkeletonLoadingOverlay() {
  const apiRef = useGridApiContext();

  const dimensions = apiRef.current?.getRootDimensions();
  const viewportHeight = dimensions?.viewportInnerSize.height ?? 0;

  // @ts-expect-error Function signature expects to be called with parameters, but the implementation suggests otherwise
  const rowHeight = apiRef.current.unstable_getRowHeight();
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
          <div
            key={`${i}-${column.field}`}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: column.align,
              height: rowHeight,
              alignItems: 'center',
            }}
          >
            <Skeleton sx={{ mx: 1 }} width={`${width}%`} />
          </div>,
        );
      }
    }
    return array;
  }, [skeletonRowsCount, columns, rowHeight]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `${columns
          .map(({ computedWidth }) => `${computedWidth}px`)
          .join(' ')}`,
        gridTemplateRows: `repeat(auto-fill, ${rowHeight}px)`,
      }}
    >
      {children}
    </div>
  );
}

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

interface ToolpadDataGridProps extends Omit<DataGridProProps, 'columns' | 'rows' | 'error'> {
  rows?: GridRowsProp;
  columns?: GridColumns;
  rowIdField?: string;
  selection: any;
  error?: Error | string;
  onSelectionChange: (newSelection: any) => void;
}

const DataGridComponent = React.forwardRef(function DataGridComponent(
  {
    columns: columnsProp,
    rows: rowsProp,
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
    const parsedRows = rowsInput;
    return parsedRows.length === 0 || hasRowIdField || !!parsedRows[0].id;
  }, [rowIdFieldProp, rowsInput]);

  const rows: GridRowsProp = React.useMemo(
    () => (hasExplicitRowId ? rowsInput : rowsInput.map((row, id) => ({ ...row, id }))),
    [hasExplicitRowId, rowsInput],
  );

  const columnsInitRef = React.useRef(false);
  const hasColumnsDefined = columnsProp && columnsProp.length > 0;

  React.useEffect(() => {
    if (!nodeRuntime || hasColumnsDefined || rows.length <= 0 || columnsInitRef.current) {
      return;
    }

    let inferredColumns = inferColumns(rows);

    if (!hasExplicitRowId) {
      inferredColumns = inferredColumns.filter((column) => column.field !== 'id');
    }

    nodeRuntime.updateAppDomConstProp('columns', inferredColumns);

    columnsInitRef.current = true;
  }, [hasColumnsDefined, rows, nodeRuntime, hasExplicitRowId]);

  const getRowId = React.useCallback(
    (row: any) => {
      return rowIdFieldProp && row[rowIdFieldProp] ? row[rowIdFieldProp] : row.id;
    },
    [rowIdFieldProp],
  );

  const onSelectionModelChange = React.useCallback(
    (ids) => {
      onSelectionChange(ids.length > 0 ? rows.find((row) => row.id === ids[0]) : null);
    },
    [rows, onSelectionChange],
  );

  const columns: GridColumns = columnsProp || EMPTY_COLUMNS;

  return (
    <div ref={ref} style={{ height: 350, width: '100%' }}>
      <DataGridPro
        components={{ Toolbar: GridToolbar, LoadingOverlay: SkeletonLoadingOverlay }}
        onColumnResize={handleResize}
        onColumnOrderChange={handleColumnOrderChange}
        rows={rows}
        columns={columns}
        key={rowIdFieldProp}
        getRowId={getRowId}
        onSelectionModelChange={onSelectionModelChange}
        selectionModel={selection ? [selection.id] : []}
        error={errorProp}
        componentsProps={{
          errorOverlay: { message: typeof errorProp === 'string' ? errorProp : errorProp?.message },
        }}
        {...props}
      />
    </div>
  );
});

DataGridComponent.defaultProps = {
  selection: null,
  density: 'compact',
} as ToolpadDataGridProps;

export default createComponent(DataGridComponent, {
  errorProp: 'error',
  loadingPropSource: ['rows', 'columns'],
  loadingProp: 'loading',
  argTypes: {
    rows: {
      typeDef: { type: 'array', schema: '/schemas/DataGridRows.json' },
    },
    columns: {
      typeDef: { type: 'array', schema: '/schemas/DataGridColumns.json' },
      control: { type: 'GridColumns' },
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
    loading: {
      typeDef: { type: 'boolean' },
    },
    rowIdField: {
      typeDef: { type: 'string' },
      control: { type: 'RowIdFieldSelect' },
      label: 'Id field',
    },
  },
});
