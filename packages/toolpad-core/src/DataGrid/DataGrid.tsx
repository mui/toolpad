'use client';

import {
  DataGrid as XDataGrid,
  DataGridProps as XDataGridProps,
  GridColDef,
  GridSlotsComponent,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridValueGetter,
  useGridApiRef,
  GridActionsCellItemProps,
  GridActionsCellItem,
  GridEventListener,
  GridPaginationModel,
} from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Button, CircularProgress, styled } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import invariant from 'invariant';
import { useNonNullableContext } from '@toolpad/utils/react';
import { errorFrom } from '@toolpad/utils/errors';
import RowsLoadingOverlay from './LoadingOverlay';
import { useNotifications } from '../useNotifications';
import { ErrorOverlay, LoadingOverlay } from '../shared';
import {
  ResolvedDataProvider,
  ResolvedField,
  Datum,
  useGetMany,
  GetManyParams,
  ValidProp,
  ResolvedFields,
} from '../DataProvider';
import InferencingAlert from './InferrencingAlert';

const RootContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

const GridContainer = styled('div')({
  flex: 1,
  position: 'relative',
});

const subscribe = () => () => {};
const getSnapshot = () => false;
const getServerSnapshot = () => true;

function useSsr() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

interface ToolbarCreateButtonContextValue {
  slotsProp?: Partial<GridSlotsComponent>;
  onClick: () => void;
  visible: boolean;
  disabled: boolean;
}

const ToolbarCreateButtonContext = React.createContext<ToolbarCreateButtonContextValue | null>(
  null,
);

const RefetchContext = React.createContext<(() => void) | null>(null);

const ACTIONS_COLUMN_FIELD = '::toolpad-internal-field::actions::';

const DRAFT_ROW_ID = '::toolpad-internal-row::draft::';

const DRAFT_ROW_MARKER = Symbol('draft-row');

function createDraftRow(): {} {
  const row = { [DRAFT_ROW_MARKER]: true };
  return row;
}

type MaybeDraftRow<R> = R & { [DRAFT_ROW_MARKER]?: true };

function isDraftRow<R>(row: MaybeDraftRow<R>): boolean {
  return !!row[DRAFT_ROW_MARKER];
}

function cleanDraftRow<R>(row: MaybeDraftRow<R>): R {
  const cleanedRow = { ...row };
  delete cleanedRow[DRAFT_ROW_MARKER];
  return cleanedRow;
}

const PlaceholderBorder = styled('div')(({ theme }) => ({
  position: 'absolute',
  inset: '0 0 0 0',
  backgroundColor: theme.palette.background.paper,
  borderColor: theme.palette.divider,
  borderWidth: 1,
  borderStyle: 'solid',
  borderRadius: theme.shape.borderRadius,
}));

type ProcessRowUpdate = XDataGridProps['processRowUpdate'];

export interface DataGridProps<R extends Datum>
  extends Omit<XDataGridProps<R>, 'columns' | 'rows'> {
  rows?: readonly R[];
  columns?: readonly GridColDef<R>[];
  dataProvider?: ResolvedDataProvider<R>;
}

const dateValueGetter = (value: any) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  return new Date(value);
};

function wrapWithDateValueGetter<R extends Datum>(
  valueGetter?: GridValueGetter<R>,
): GridValueGetter<R> {
  if (!valueGetter) {
    return dateValueGetter;
  }

  return (oldValue, ...args) => {
    const newValue = valueGetter(oldValue, ...args);
    return dateValueGetter(newValue);
  };
}

interface DeleteActionProps<R extends Datum> {
  id: GridRowId;
  dataProvider: ResolvedDataProvider<R>;
}

function DeleteAction<R extends Datum>({ id, dataProvider }: DeleteActionProps<R>) {
  const refetch = useNonNullableContext(RefetchContext);
  const [pending, setPending] = React.useState(false);

  const notifications = useNotifications();

  const handleDeleteClick = React.useCallback(async () => {
    try {
      setPending(true);
      invariant(dataProvider.deleteOne, 'deleteOne not implemented');
      await dataProvider.deleteOne(id);
      notifications.show('Row deleted', {
        severity: 'success',
        autoHideDuration: 5000,
      });
    } catch (error) {
      notifications.show('Failed to delete row', { severity: 'error' });
    } finally {
      setPending(false);
      await refetch();
    }
  }, [dataProvider, id, notifications, refetch]);

  return (
    <GridActionsCellItem
      icon={pending ? <CircularProgress size={16} /> : <DeleteIcon fontSize="inherit" />}
      label={`Delete "${id}"`}
      onClick={handleDeleteClick}
    />
  );
}

function inferFields(rows: any[]): ResolvedFields<any> {
  const result: any = {};

  const types = new Map<string, Set<string>>();

  const rowsToConsider = 10;
  const rowSlice = rows.slice(0, rowsToConsider);

  for (const row of rowSlice) {
    for (const key of Object.keys(row)) {
      const value = row[key];
      const type = typeof value;
      const existingType = types.get(key);
      if (existingType) {
        existingType.add(type);
      } else {
        types.set(key, new Set([type]));
      }
    }
  }

  for (const [field, value] of Array.from(types.entries())) {
    if (value.size === 1) {
      const type = value.size === 1 ? Array.from(value)[0] : 'string';
      result[field] = { type };
    }
  }

  return result;
}

interface GridState {
  editedRowId: GridRowId | null;
  isProcessingRowUpdate: boolean;
  rowModesModel: GridRowModesModel;
}

type GridAction =
  | { kind: 'START_ROW_EDIT'; rowId: GridRowId }
  | { kind: 'CANCEL_ROW_EDIT' }
  | { kind: 'START_ROW_UPDATE' }
  | { kind: 'END_ROW_UPDATE' };

function gridEditingReducer(state: GridState, action: GridAction): GridState {
  switch (action.kind) {
    case 'START_ROW_EDIT':
      if (state.editedRowId !== null) {
        return state;
      }
      return {
        ...state,
        editedRowId: action.rowId,
        rowModesModel: {
          [action.rowId]: {
            mode: GridRowModes.Edit,
          },
        },
      };
    case 'CANCEL_ROW_EDIT':
      return {
        ...state,
        editedRowId: null,
        rowModesModel: state.editedRowId
          ? {
              [state.editedRowId]: {
                mode: GridRowModes.View,
                ignoreModifications: true,
              },
            }
          : {},
      };
    case 'START_ROW_UPDATE':
      return {
        ...state,
        isProcessingRowUpdate: true,
        rowModesModel: {},
      };
    case 'END_ROW_UPDATE':
      return { ...state, editedRowId: null, isProcessingRowUpdate: false };
    default:
      throw new Error(`Unhandled action: ${JSON.stringify(action)}`);
  }
}
/**
 *
 * Demos:
 *
 * - [Data Grid](https://mui.com/)
 *
 * API:
 *
 * - [DataGrid API](https://mui.com/toolpad/core/api/data-grid)
 */
export function getColumnsFromDataProviderFields<R extends Datum>(
  fields?: ResolvedFields<R>,
  baseColumns?: readonly GridColDef<R>[],
): readonly GridColDef<R>[] {
  const fieldMap = new Map<keyof R & string, ResolvedField<R, any>>(Object.entries(fields ?? {}));

  baseColumns = baseColumns ?? Object.keys(fields ?? {}).map((field) => ({ field }));

  const resolvedColumns = baseColumns.map(function mapper<K extends ValidProp<R>>(
    baseColDef: GridColDef<R, R[K], string>,
  ): GridColDef<R, R[K], string> {
    const dataProviderField: ResolvedField<R, K> | undefined = fieldMap.get(baseColDef.field);
    const colDef: GridColDef<R, R[K], string> = {
      type: dataProviderField?.type,
      headerName: dataProviderField?.label,
      ...baseColDef,
    };

    const valueFormatter = dataProviderField?.valueFormatter;
    if (valueFormatter && !colDef.valueFormatter) {
      colDef.valueFormatter = (value) => valueFormatter(value, colDef.field as K);
    }

    let valueGetter: GridValueGetter<R> | undefined = colDef.valueGetter;

    if (colDef.type === 'date' || colDef.type === 'dateTime') {
      valueGetter = wrapWithDateValueGetter(valueGetter);
    }

    return {
      ...colDef,
      valueGetter,
    };
  });

  return resolvedColumns;
}

function updateColumnsWithDataProviderEditing<R extends Datum>(
  dataProvider: ResolvedDataProvider<R>,
  baseColumns: readonly GridColDef<R>[],
  state: GridState,
  dispatch: React.Dispatch<GridAction>,
): readonly GridColDef<R>[] {
  const canEdit = !!dataProvider.updateOne;
  const canDelete = !!dataProvider.deleteOne;
  const canCreate = !!dataProvider.createOne;
  const hasEditableRows = canCreate || canEdit;
  const hasActionsColumn: boolean = canCreate || canEdit || canDelete;

  const resolvedColumns = baseColumns.map(function mapper<K extends ValidProp<R>>(
    baseColDef: GridColDef<R, R[K], string>,
  ): GridColDef<R, R[K], string> {
    const colDef = { ...baseColDef };

    if (hasEditableRows && colDef.field !== 'id') {
      colDef.editable = true;
    }

    return colDef;
  });

  if (hasActionsColumn) {
    resolvedColumns.push({
      field: ACTIONS_COLUMN_FIELD,
      headerName: 'Actions',
      type: 'actions',
      align: 'center',
      resizable: false,
      pinnable: false,
      width: 100,
      getActions: (params) => {
        const actions: React.ReactElement<GridActionsCellItemProps>[] = [];

        const isEditing = state.editedRowId !== null || state.isProcessingRowUpdate;
        const isEditedRow = params.id === state.editedRowId;

        if (isEditedRow) {
          actions.push(
            <GridActionsCellItem
              key="save"
              icon={state.isProcessingRowUpdate ? <CircularProgress size={16} /> : <SaveIcon />}
              label="Save"
              disabled={state.isProcessingRowUpdate}
              onClick={() => {
                dispatch({ kind: 'START_ROW_UPDATE' });
              }}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CloseIcon />}
              label="Cancel"
              disabled={state.isProcessingRowUpdate}
              onClick={() => {
                dispatch({ kind: 'CANCEL_ROW_EDIT' });
              }}
            />,
          );
        } else {
          if (canEdit) {
            actions.push(
              <GridActionsCellItem
                key="update"
                icon={<EditIcon />}
                label="Edit"
                disabled={isEditing}
                onClick={() => {
                  dispatch({ kind: 'START_ROW_EDIT', rowId: params.id });
                }}
              />,
            );
          }
          if (canDelete) {
            actions.push(<DeleteAction key="delete" id={params.id} dataProvider={dataProvider} />);
          }
        }
        return actions;
      },
    });
  }

  return resolvedColumns;
}

function ToolbarGridCreateButton() {
  const { visible, slotsProp, onClick, disabled } = useNonNullableContext(
    ToolbarCreateButtonContext,
  );
  const ButtonComponent = slotsProp?.baseButton ?? Button;
  return visible ? (
    <ButtonComponent color="primary" startIcon={<AddIcon />} onClick={onClick} disabled={disabled}>
      Add record
    </ButtonComponent>
  ) : null;
}

function ToolbarGridToolbar() {
  return (
    <GridToolbarContainer>
      <ToolbarGridCreateButton />
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

function usePatchedRowModesModel(rowModesModel: GridRowModesModel): GridRowModesModel {
  const prevRowModesModel = React.useRef(rowModesModel);
  React.useEffect(() => {
    prevRowModesModel.current = rowModesModel;
  }, [rowModesModel]);

  return React.useMemo(() => {
    if (rowModesModel === prevRowModesModel.current) {
      return rowModesModel;
    }
    const base = Object.fromEntries(
      Object.keys(prevRowModesModel.current).map((rowId) => [rowId, { mode: GridRowModes.View }]),
    );
    return { ...base, ...rowModesModel };
  }, [rowModesModel]);
}

function diffRows<R extends Record<PropertyKey, unknown>>(original: R, changed: R): Partial<R> {
  const keys = new Set([...Object.keys(original), ...Object.keys(changed)]);
  const diff: Partial<R> = {};
  Array.prototype.forEach.call(keys, (key: keyof R) => {
    const originalValue = original[key];
    const changedValue = changed[key];
    if (Object.is(originalValue, changedValue)) {
      return;
    }
    if (
      originalValue instanceof Date &&
      changedValue instanceof Date &&
      originalValue.getTime() === changedValue.getTime()
    ) {
      return;
    }
    (diff as any)[key] = changed[key];
  });
  return diff;
}

/**
 *
 * Demos:
 *
 * - [Data Grid](https://mui.com/)
 *
 * API:
 *
 * - [DataGrid API](https://mui.com/toolpad/core/api/data-grid)
 */
const DataGrid = function DataGrid<R extends Datum>(props: DataGridProps<R>) {
  const {
    dataProvider,
    columns: columnsProp,
    processRowUpdate: processRowUpdateProp,
    slots: slotsProp,
    apiRef: apiRefProp,
    initialState: initialStateProp,
    autosizeOptions: autosizeOptionsProp,
    getRowId: getRowIdProp,
    rowModesModel: rowModesModelProp,
    ...restProps
  } = props;

  const gridApiRefOwn = useGridApiRef();
  const apiRef = apiRefProp ?? gridApiRefOwn;

  const [gridPaginationModel, setGridPaginationModel] = React.useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  const [editingState, dispatchEditingAction] = React.useReducer(gridEditingReducer, {
    editedRowId: null,
    isProcessingRowUpdate: false,
    rowModesModel: {},
  });

  const handleCreateRowRequest = React.useCallback(() => {
    dispatchEditingAction({ kind: 'START_ROW_EDIT', rowId: DRAFT_ROW_ID });
  }, []);

  const notifications = useNotifications();

  const useGetManyParams = React.useMemo<GetManyParams<R>>(
    () => ({
      pagination:
        restProps.paginationMode === 'server'
          ? {
              start: gridPaginationModel.page * gridPaginationModel.pageSize,
              pageSize: gridPaginationModel.pageSize,
            }
          : null,
      filter: {},
    }),
    [gridPaginationModel.page, gridPaginationModel.pageSize, restProps.paginationMode],
  );

  const { data, loading, error, refetch } = useGetMany(dataProvider ?? null, useGetManyParams);

  const rows = React.useMemo(() => {
    const renderedRows = data?.rows ?? [];
    if (editingState.editedRowId === DRAFT_ROW_ID) {
      return [createDraftRow(), ...renderedRows];
    }
    return renderedRows;
  }, [data?.rows, editingState.editedRowId]);

  const processRowUpdate = React.useMemo<ProcessRowUpdate>(() => {
    if (processRowUpdateProp) {
      return processRowUpdateProp;
    }
    const updateOne = dataProvider?.updateOne;
    const createOne = dataProvider?.createOne;
    if (!(updateOne || createOne)) {
      return undefined;
    }
    return async (updatedRow: R, originalRow: R): Promise<R> => {
      try {
        let result: R;
        if (isDraftRow(updatedRow)) {
          invariant(createOne, 'createOne not implemented');

          const rowInit = cleanDraftRow(updatedRow);

          try {
            result = await createOne(rowInit);
          } catch (creationError) {
            let message = 'Failed to create row';
            if (process.env.NODE_ENV !== 'production') {
              message = `${message}: ${errorFrom(creationError).message}`;
            }
            notifications.show(message, {
              severity: 'error',
            });
            return { ...originalRow, _action: 'delete' };
          }

          const key = notifications.show('Row created', {
            severity: 'success',
            actionText: 'Show',
            autoHideDuration: 5000,
            onAction: () => {
              apiRef.current.setFilterModel({
                items: [{ field: 'id', operator: 'equals', value: String(result.id) }],
              });
              notifications.close(key);
            },
          });
        } else {
          invariant(updateOne, 'updateOne not implemented');

          const changedValues = diffRows(originalRow, updatedRow);
          if (Object.keys(changedValues).length <= 0) {
            return originalRow;
          }

          try {
            result = await updateOne(updatedRow.id, changedValues);
          } catch (updateError) {
            let message = 'Failed to update row';
            if (process.env.NODE_ENV !== 'production') {
              message = `${message}: ${errorFrom(updateError).message}`;
            }
            notifications.show(message, {
              severity: 'error',
            });
            return originalRow;
          }

          const key = notifications.show('Row updated', {
            severity: 'success',
            autoHideDuration: 5000,
            actionText: 'Show',
            onAction: () => {
              apiRef.current.setFilterModel({
                items: [{ field: 'id', operator: 'equals', value: String(result.id) }],
              });
              notifications.close(key);
            },
          });
        }

        return result;
      } finally {
        dispatchEditingAction({ kind: 'END_ROW_UPDATE' });
        refetch();
      }
    };
  }, [
    apiRef,
    dataProvider?.createOne,
    dataProvider?.updateOne,
    notifications,
    processRowUpdateProp,
    refetch,
  ]);

  const slots = React.useMemo<Partial<GridSlotsComponent>>(
    () => ({
      loadingOverlay: RowsLoadingOverlay,
      toolbar: ToolbarGridToolbar,
      ...slotsProp,
    }),
    [slotsProp],
  );
  const hasCreateButton = !!dataProvider?.createOne;

  const createButtonContext = React.useMemo(() => {
    return {
      slotsProp,
      onClick: () => {
        handleCreateRowRequest();
      },
      visible: hasCreateButton,
      disabled: !!editingState.editedRowId || loading,
    };
  }, [editingState.editedRowId, handleCreateRowRequest, hasCreateButton, loading, slotsProp]);

  const getRowId = React.useCallback(
    (row: R) => {
      if (isDraftRow(row)) {
        return DRAFT_ROW_ID;
      }
      if (getRowIdProp) {
        return getRowIdProp(row);
      }
      return row.id;
    },
    [getRowIdProp],
  );

  // Remove when https://github.com/mui/mui-x/issues/11423 is fixed
  const rowModesModelPatched = usePatchedRowModesModel(editingState.rowModesModel ?? {});

  const handleRowEditStart = React.useCallback<GridEventListener<'rowEditStart'>>((params) => {
    if (params.reason === 'cellDoubleClick') {
      dispatchEditingAction({ kind: 'START_ROW_EDIT', rowId: params.id });
    }
  }, []);

  // Calculate separately to avoid re-calculating columns on every render
  const inferredFields = React.useMemo<ResolvedFields<R> | null>(() => {
    if (!dataProvider) {
      // There are no rows coming from the data provider
      return null;
    }
    if (dataProvider.fields) {
      // The data provider already provides fields
      return null;
    }
    if (!data?.rows) {
      return null;
    }
    return inferFields(data.rows);
  }, [dataProvider, data?.rows]);

  const columns = React.useMemo(() => {
    if (!dataProvider) {
      return columnsProp ?? [];
    }

    let gridColumns = getColumnsFromDataProviderFields(
      inferredFields ?? dataProvider.fields,
      columnsProp,
    );

    gridColumns = updateColumnsWithDataProviderEditing(
      dataProvider,
      gridColumns,
      editingState,
      dispatchEditingAction,
    );

    return gridColumns;
  }, [columnsProp, dataProvider, editingState, inferredFields]);

  const isSsr = useSsr();

  return (
    <RefetchContext.Provider value={refetch}>
      <ToolbarCreateButtonContext.Provider value={createButtonContext}>
        <RootContainer
          sx={{
            height: restProps.autoHeight ? undefined : '100%',
          }}
        >
          {inferredFields ? <InferencingAlert fields={inferredFields} /> : null}
          <GridContainer>
            <XDataGrid
              pagination
              apiRef={apiRef}
              rows={rows}
              columns={columns}
              loading={loading}
              processRowUpdate={processRowUpdate}
              slots={slots}
              rowModesModel={rowModesModelPatched}
              onRowEditStart={handleRowEditStart}
              getRowId={getRowId}
              {...(restProps.paginationMode === 'server'
                ? {
                    gridPaginationModel,
                    onPaginationModelChange: setGridPaginationModel,
                    rowCount: data?.totalCount ?? -1,
                  }
                : {})}
              {...restProps}
              // TODO: How can we make this optional?
              editMode="row"
            />
            {isSsr ? (
              // At last show something during SSR https://github.com/mui/mui-x/issues/7599
              <PlaceholderBorder>
                <LoadingOverlay />
              </PlaceholderBorder>
            ) : null}

            {error ? (
              <PlaceholderBorder>
                <ErrorOverlay error={error} />
              </PlaceholderBorder>
            ) : null}
          </GridContainer>
        </RootContainer>
      </ToolbarCreateButtonContext.Provider>
    </RefetchContext.Provider>
  );
};

DataGrid.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The ref object that allows Data Grid manipulation. Can be instantiated with `useGridApiRef()`.
   */
  apiRef: PropTypes.shape({
    current: PropTypes.object.isRequired,
  }),
  /**
   * If `true`, the Data Grid height is dynamic and follow the number of rows in the Data Grid.
   * @default false
   */
  autoHeight: PropTypes.bool,
  /**
   * The options for autosize when user-initiated.
   */
  autosizeOptions: PropTypes.shape({
    columns: PropTypes.arrayOf(PropTypes.string),
    expand: PropTypes.bool,
    includeHeaders: PropTypes.bool,
    includeOutliers: PropTypes.bool,
    outliersFactor: PropTypes.number,
  }),
  /**
   * @ignore
   */
  columns: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        align: PropTypes.oneOf(['center', 'left', 'right']),
        cellClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        colSpan: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        description: PropTypes.string,
        disableColumnMenu: PropTypes.bool,
        disableExport: PropTypes.bool,
        disableReorder: PropTypes.bool,
        display: PropTypes.oneOf(['flex', 'text']),
        editable: PropTypes.bool,
        field: PropTypes.string.isRequired,
        filterable: PropTypes.bool,
        filterOperators: PropTypes.arrayOf(
          PropTypes.shape({
            getApplyFilterFn: PropTypes.func.isRequired,
            getValueAsString: PropTypes.func,
            headerLabel: PropTypes.string,
            InputComponent: PropTypes.elementType,
            InputComponentProps: PropTypes.object,
            label: PropTypes.string,
            requiresFilterValue: PropTypes.bool,
            value: PropTypes.string.isRequired,
          }),
        ),
        flex: PropTypes.number,
        getApplyQuickFilterFn: PropTypes.func,
        getSortComparator: PropTypes.func,
        groupable: PropTypes.bool,
        headerAlign: PropTypes.oneOf(['center', 'left', 'right']),
        headerClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        headerName: PropTypes.string,
        hideable: PropTypes.bool,
        hideSortIcons: PropTypes.bool,
        maxWidth: PropTypes.number,
        minWidth: PropTypes.number,
        pinnable: PropTypes.bool,
        preProcessEditCellProps: PropTypes.func,
        renderCell: PropTypes.func,
        renderEditCell: PropTypes.func,
        renderHeader: PropTypes.func,
        resizable: PropTypes.bool,
        sortable: PropTypes.bool,
        sortComparator: PropTypes.func,
        sortingOrder: PropTypes.arrayOf(PropTypes.oneOf(['asc', 'desc'])),
        type: PropTypes.oneOf([
          'actions',
          'boolean',
          'custom',
          'date',
          'dateTime',
          'number',
          'singleSelect',
          'string',
        ]),
        valueFormatter: PropTypes.func,
        valueGetter: PropTypes.func,
        valueParser: PropTypes.func,
        valueSetter: PropTypes.func,
        width: PropTypes.number,
      }),
      PropTypes.shape({
        align: PropTypes.oneOf(['center', 'left', 'right']),
        cellClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        colSpan: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        description: PropTypes.string,
        disableColumnMenu: PropTypes.bool,
        disableExport: PropTypes.bool,
        disableReorder: PropTypes.bool,
        display: PropTypes.oneOf(['flex', 'text']),
        editable: PropTypes.bool,
        field: PropTypes.string.isRequired,
        filterable: PropTypes.bool,
        filterOperators: PropTypes.arrayOf(
          PropTypes.shape({
            getApplyFilterFn: PropTypes.func.isRequired,
            getValueAsString: PropTypes.func,
            headerLabel: PropTypes.string,
            InputComponent: PropTypes.elementType,
            InputComponentProps: PropTypes.object,
            label: PropTypes.string,
            requiresFilterValue: PropTypes.bool,
            value: PropTypes.string.isRequired,
          }),
        ),
        flex: PropTypes.number,
        getActions: PropTypes.func.isRequired,
        getApplyQuickFilterFn: PropTypes.func,
        getSortComparator: PropTypes.func,
        groupable: PropTypes.bool,
        headerAlign: PropTypes.oneOf(['center', 'left', 'right']),
        headerClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        headerName: PropTypes.string,
        hideable: PropTypes.bool,
        hideSortIcons: PropTypes.bool,
        maxWidth: PropTypes.number,
        minWidth: PropTypes.number,
        pinnable: PropTypes.bool,
        preProcessEditCellProps: PropTypes.func,
        renderCell: PropTypes.func,
        renderEditCell: PropTypes.func,
        renderHeader: PropTypes.func,
        resizable: PropTypes.bool,
        sortable: PropTypes.bool,
        sortComparator: PropTypes.func,
        sortingOrder: PropTypes.arrayOf(PropTypes.oneOf(['asc', 'desc'])),
        type: PropTypes.oneOf([
          /**
           * The type of the column.
           * @default 'actions'
           */
          'actions',
        ]).isRequired,
        valueFormatter: PropTypes.func,
        valueGetter: PropTypes.func,
        valueParser: PropTypes.func,
        valueSetter: PropTypes.func,
        width: PropTypes.number,
      }),
      PropTypes.shape({
        align: PropTypes.oneOf(['center', 'left', 'right']),
        cellClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        colSpan: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        description: PropTypes.string,
        disableColumnMenu: PropTypes.bool,
        disableExport: PropTypes.bool,
        disableReorder: PropTypes.bool,
        display: PropTypes.oneOf(['flex', 'text']),
        editable: PropTypes.bool,
        field: PropTypes.string.isRequired,
        filterable: PropTypes.bool,
        filterOperators: PropTypes.arrayOf(
          PropTypes.shape({
            getApplyFilterFn: PropTypes.func.isRequired,
            getValueAsString: PropTypes.func,
            headerLabel: PropTypes.string,
            InputComponent: PropTypes.elementType,
            InputComponentProps: PropTypes.object,
            label: PropTypes.string,
            requiresFilterValue: PropTypes.bool,
            value: PropTypes.string.isRequired,
          }),
        ),
        flex: PropTypes.number,
        getApplyQuickFilterFn: PropTypes.func,
        getOptionLabel: PropTypes.func,
        getOptionValue: PropTypes.func,
        getSortComparator: PropTypes.func,
        groupable: PropTypes.bool,
        headerAlign: PropTypes.oneOf(['center', 'left', 'right']),
        headerClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        headerName: PropTypes.string,
        hideable: PropTypes.bool,
        hideSortIcons: PropTypes.bool,
        maxWidth: PropTypes.number,
        minWidth: PropTypes.number,
        pinnable: PropTypes.bool,
        preProcessEditCellProps: PropTypes.func,
        renderCell: PropTypes.func,
        renderEditCell: PropTypes.func,
        renderHeader: PropTypes.func,
        resizable: PropTypes.bool,
        sortable: PropTypes.bool,
        sortComparator: PropTypes.func,
        sortingOrder: PropTypes.arrayOf(PropTypes.oneOf(['asc', 'desc'])),
        type: PropTypes.oneOf([
          /**
           * The type of the column.
           * @default 'singleSelect'
           */
          'singleSelect',
        ]).isRequired,
        valueFormatter: PropTypes.func,
        valueGetter: PropTypes.func,
        valueOptions: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([
              PropTypes.number,
              PropTypes.object,
              PropTypes.shape({
                label: PropTypes.string.isRequired,
                value: PropTypes.any.isRequired,
              }),
              PropTypes.string,
            ]).isRequired,
          ),
          PropTypes.func,
        ]),
        valueParser: PropTypes.func,
        valueSetter: PropTypes.func,
        width: PropTypes.number,
      }),
    ]).isRequired,
  ),
  /**
   * @ignore
   */
  dataProvider: PropTypes.shape({
    createOne: PropTypes.func,
    deleteOne: PropTypes.func,
    fields: PropTypes.object,
    getMany: PropTypes.func.isRequired,
    getOne: PropTypes.func,
    updateOne: PropTypes.func,
  }),
  /**
   * Return the id of a given [[GridRowModel]].
   */
  getRowId: PropTypes.func,
  /**
   * The initial state of the DataGrid.
   * The data in it will be set in the state on initialization but will not be controlled.
   * If one of the data in `initialState` is also being controlled, then the control state wins.
   */
  initialState: PropTypes.shape({
    columns: PropTypes.shape({
      columnVisibilityModel: PropTypes.object,
      dimensions: PropTypes.object,
      orderedFields: PropTypes.arrayOf(PropTypes.string),
    }),
    density: PropTypes.oneOf(['comfortable', 'compact', 'standard']),
    filter: PropTypes.shape({
      filterModel: PropTypes.shape({
        items: PropTypes.arrayOf(PropTypes.object).isRequired,
        logicOperator: PropTypes.oneOf(['and', 'or']),
        quickFilterExcludeHiddenColumns: PropTypes.bool,
        quickFilterLogicOperator: PropTypes.oneOf(['and', 'or']),
        quickFilterValues: PropTypes.array,
      }),
    }),
    pagination: PropTypes.shape({
      meta: PropTypes.shape({
        hasNextPage: PropTypes.bool,
      }),
      paginationModel: PropTypes.shape({
        page: PropTypes.number,
        pageSize: PropTypes.number,
      }),
      rowCount: PropTypes.number,
    }),
    preferencePanel: PropTypes.shape({
      labelId: PropTypes.string,
      open: PropTypes.bool.isRequired,
      openedPanelValue: PropTypes.oneOf(['columns', 'filters']),
      panelId: PropTypes.string,
    }),
    sorting: PropTypes.shape({
      sortModel: PropTypes.arrayOf(
        PropTypes.shape({
          field: PropTypes.string.isRequired,
          sort: PropTypes.oneOf(['asc', 'desc']),
        }),
      ),
    }),
  }),
  /**
   * Pagination can be processed on the server or client-side.
   * Set it to 'client' if you would like to handle the pagination on the client-side.
   * Set it to 'server' if you would like to handle the pagination on the server-side.
   * @default "client"
   */
  paginationMode: PropTypes.oneOf(['client', 'server']),
  /**
   * Callback called before updating a row with new values in the row and cell editing.
   * @template R
   * @param {R} newRow Row object with the new values.
   * @param {R} oldRow Row object with the old values.
   * @returns {Promise<R> | R} The final values to update the row.
   */
  processRowUpdate: PropTypes.func,
  /**
   * Controls the modes of the rows.
   */
  rowModesModel: PropTypes.object,
  /**
   * @ignore
   */
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    }),
  ),
  /**
   * Overridable components.
   */
  slots: PropTypes.object,
} as any;

export { DataGrid };
