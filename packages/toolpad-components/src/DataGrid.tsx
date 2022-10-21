import {
  DataGridProProps,
  DataGridPro,
  GridToolbar,
  GridColumnResizeParams,
  GridColumns,
  GridCellParams,
  GridEventListener,
  GridRowId,
  GridRowsProp,
  GridRowModes,
  GridRowModesModel,
  GridRowParams,
  GridColumnOrderChangeParams,
  useGridApiContext,
  gridColumnsTotalWidthSelector,
  gridColumnPositionsSelector,
  gridDensityRowHeightSelector,
  GridSelectionModel,
  GridValueFormatterParams,
  GridActionsCellItem,
  GridColDef,
  GridValueGetterParams,
  MuiEvent,
  MuiBaseEvent,
  useGridApiRef,
} from '@mui/x-data-grid-pro';
import * as React from 'react';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
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
      type: inferColumnType(value),
    };
  });
}

export function parseColumns(columns: SerializableGridColumns): GridColumns {
  return columns.map(({ type, ...column }) => ({
    type: DEFAULT_TYPES.has(type) ? type : undefined,
    ...column,
    ...COLUMN_TYPES[type],
    editable: true,
  }));
}

const EMPTY_ROWS: GridRowsProp = [];

interface Selection {
  id?: any;
}

interface OnDeleteEvent {
  event: {
    row: GridRowsProp[number];
  };
}

interface OnUpdateEvent {
  event: {
    row: GridRowsProp[number];
  };
}

interface ToolpadDataGridProps extends Omit<DataGridProProps, 'columns' | 'rows' | 'error'> {
  rows?: GridRowsProp;
  columns?: SerializableGridColumns;
  height?: number;
  rowIdField?: string;
  error?: Error | string;
  selection?: Selection | null;
  onSelectionChange?: (newSelection?: Selection | null) => void;
  onDelete?: (event: OnDeleteEvent) => void;
  onUpdate?: (event: OnUpdateEvent) => void;
  hideToolbar?: boolean;
}

const DataGridComponent = React.forwardRef(function DataGridComponent(
  {
    columns: columnsProp,
    rows: rowsProp,
    height: heightProp,
    rowIdField: rowIdFieldProp,
    error: errorProp,
    selection,
    onDelete: onDeleteProp,
    onUpdate: onUpdateProp,
    onSelectionChange,
    hideToolbar,
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
    (ids: GridSelectionModel) => {
      onSelectionChange?.(ids.length > 0 ? rows.find((row) => row.id === ids[0]) : null);
    },
    [rows, onSelectionChange],
  );

  const selectionModel = React.useMemo(
    () => (selection?.id ? [selection.id] : []),
    [selection?.id],
  );

  const columns: GridColumns = React.useMemo(() => {
    return columnsProp ? parseColumns(columnsProp) : [];
  }, [columnsProp]);

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  const handleRowEditStart = React.useCallback(
    (params: GridRowParams, event: MuiEvent<React.SyntheticEvent>) => {
      event.defaultMuiPrevented = true;
    },
    [],
  );

  const handleRowEditStop: GridEventListener<'rowEditStop'> = React.useCallback(
    (params: GridRowParams, event: MuiEvent<MuiBaseEvent>) => {
      event.defaultMuiPrevented = true;
    },
    [],
  );

  const handleCancelClick = React.useCallback(
    (id: GridRowId) => () => {
      setRowModesModel({
        ...rowModesModel,
        [id]: { mode: GridRowModes.View, ignoreModifications: true },
      });
    },
    [rowModesModel],
  );

  const handleSaveClick = React.useCallback(
    (id: GridRowId) => () => {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    },
    [],
  );

  const processRowUpdate = React.useCallback(
    (newRow: GridRowsProp[number]) => {
      const updatedRow = { ...newRow, isNew: false };
      if (onUpdateProp) {
        onUpdateProp({ event: { row: updatedRow } });
      }
      return updatedRow;
    },
    [onUpdateProp],
  );

  const actionField = React.useMemo(() => {
    return onDeleteProp || onUpdateProp
      ? {
          field: 'actions',
          headerName: 'Actions',
          width: 100,
          type: 'actions',
          getActions: ({ id, row }: GridCellParams) => {
            const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
            if (isInEditMode) {
              return [
                <GridActionsCellItem
                  icon={<SaveIcon />}
                  label="Save"
                  onClick={handleSaveClick(id)}
                />,
                <GridActionsCellItem
                  icon={<CancelIcon />}
                  label="Cancel"
                  onClick={handleCancelClick(id)}
                />,
              ];
            }
            return [
              onUpdateProp ? (
                <GridActionsCellItem
                  icon={<EditIcon />}
                  label="Edit"
                  onClick={() => {
                    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
                  }}
                />
              ) : (
                <></>
              ),
              onDeleteProp ? (
                <GridActionsCellItem
                  key={'delete'}
                  icon={<DeleteIcon />}
                  label="Delete"
                  onClick={() => {
                    onDeleteProp({ event: { row } });
                  }}
                />
              ) : (
                <></>
              ),
            ];
          },
        }
      : null;
  }, [onDeleteProp, onUpdateProp, rowModesModel]);

  const columnsWithActions = React.useMemo(() => {
    return actionField ? [...columns, actionField] : columns;
  }, [columns, actionField]);

  const apiRef = useGridApiRef();
  React.useEffect(() => apiRef.current.updateColumns(columns), [apiRef, columns]);

  // The grid doesn't update when the getRowId or columns properties change, so it needs to be remounted
  // TODO: remove columns from this equation once https://github.com/mui/mui-x/issues/5970 gets resolved
  const gridKey = React.useMemo(
    () => [getObjectKey(getRowId), getObjectKey(columns)].join('::'),
    [getRowId, columns],
  );

  return (
    <div ref={ref} style={{ height: heightProp, minHeight: '100%', width: '100%' }}>
      <DataGridPro
        apiRef={apiRef}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
        onRowEditStart={handleRowEditStart}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        experimentalFeatures={{ newEditingApi: true }}
        components={{
          Toolbar: hideToolbar ? null : GridToolbar,
          LoadingOverlay: SkeletonLoadingOverlay,
        }}
        onColumnResize={handleResize}
        onColumnOrderChange={handleColumnOrderChange}
        rows={rows}
        columns={columnsWithActions}
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
    },
    columns: {
      typeDef: { type: 'array', schema: '/schemas/DataGridColumns.json' },
      control: { type: 'GridColumns' },
    },
    rowIdField: {
      typeDef: { type: 'string' },
      control: { type: 'RowIdFieldSelect' },
      label: 'Id field',
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
    hideToolbar: {
      typeDef: { type: 'boolean' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
    onDelete: {
      typeDef: {
        type: 'event',
        arguments: [
          {
            name: 'event',
            tsType: `{ row: ThisComponent['rows'][number] }`,
          },
        ],
      },
    },
    onUpdate: {
      typeDef: {
        type: 'event',
        arguments: [
          {
            name: 'event',
            tsType: `{ row: ThisComponent['rows'][number] }`,
          },
        ],
      },
    },
  },
});
