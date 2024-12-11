'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Button, { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
  DataGridProps,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  GridEventListener,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDialogs } from '../useDialogs';
import { useNotifications } from '../useNotifications';
import { CRUDFields, DataModel, DataModelId } from './shared';

const ErrorOverlay = styled('div')(({ theme }) => ({
  position: 'absolute',
  backgroundColor: theme.palette.error.light,
  borderRadius: '4px',
  top: 0,
  height: '100%',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  p: 1,
  zIndex: 10,
}));

interface GetManyParams {
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
}

export interface ListSlotProps {
  dataGrid?: DataGridProps;
}

export interface ListSlots {
  /**
   * The DataGrid component used to list the items.
   * @default DataGrid
   */
  dataGrid?: React.JSXElementConstructor<DataGridProps>;
}

export interface ListProps<D extends DataModel> {
  /**
   * Fields to show.
   */
  fields: CRUDFields;
  /**
   * Methods to interact with server-side data.
   */
  methods: {
    getMany: (params: GetManyParams) => Promise<{ items: D[]; itemCount: number }>;
    deleteOne?: (id: DataModelId) => Promise<void>;
  };
  /**
   * Initial number of rows to show per page.
   * @default 100
   */
  initialPageSize?: number;
  /**
   * Callback fired when a row is clicked. Not called if the target clicked is an interactive element added by the built-in columns.
   */
  onRowClick?: (id: DataModelId) => void;
  /**
   * Callback fired when the "Create" button is clicked.
   */
  onCreateClick?: ButtonProps['onClick'];
  /**
   * Callback fired when the "Edit" button is clicked.
   */
  onEditClick?: ButtonProps['onClick'];
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots?: ListSlots;
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: ListSlotProps;
}

function List<D extends DataModel>(props: ListProps<D>) {
  const {
    fields,
    methods,
    initialPageSize = 100,
    onRowClick,
    onCreateClick,
    onEditClick,
    slots,
    slotProps,
  } = props;
  const { getMany, deleteOne } = methods;

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [rowsState, setRowsState] = React.useState<{ rows: D[]; rowCount: number }>({
    rows: [],
    rowCount: 0,
  });

  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: initialPageSize,
  });
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({ items: [] });
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const listData = await getMany({
        paginationModel,
        sortModel,
        filterModel,
      });
      setRowsState({
        rows: listData.items,
        rowCount: listData.itemCount,
      });
    } catch (listDataError) {
      setError(listDataError as Error);
    }
    setIsLoading(false);
  }, [filterModel, getMany, paginationModel, sortModel]);

  React.useEffect(() => {
    loadData();
  }, [filterModel, getMany, loadData, paginationModel, sortModel]);

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) {
      loadData();
    }
  }, [isLoading, loadData]);

  const handleRowClick = React.useCallback<GridEventListener<'rowClick'>>(
    ({ row }) => {
      if (onRowClick) {
        onRowClick(row.id);
      }
    },
    [onRowClick],
  );

  const handleItemDelete = React.useCallback(
    (itemId: DataModelId) => async () => {
      const confirmed = await dialogs.confirm(`Do you wish to delete item "${itemId}"?`, {
        title: 'Delete item?',
        severity: 'error',
        okText: 'Delete',
        cancelText: 'Cancel',
      });

      if (confirmed) {
        setIsLoading(true);
        try {
          await deleteOne?.(itemId);
          notifications.show('Item deleted successfully.', {
            severity: 'success',
          });
          loadData();
        } catch (deleteError) {
          notifications.show(`Failed to delete item. Reason: ${(deleteError as Error).message}`, {
            severity: 'error',
          });
        }
        setIsLoading(false);
      }
    },
    [deleteOne, dialogs, loadData, notifications],
  );

  const DataGridSlot = slots?.dataGrid ?? DataGrid;

  const initialState = React.useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: initialPageSize } },
    }),
    [initialPageSize],
  );

  const columns = React.useMemo<GridColDef[]>(() => {
    const lastField = fields[fields.length - 1];

    return [
      ...fields.slice(0, fields.length - 1),
      {
        ...lastField,
        flex: lastField.flex ?? 1,
      },
      {
        field: 'actions',
        type: 'actions',
        getActions: ({ id }) => [
          ...(onEditClick
            ? [
                <GridActionsCellItem
                  key="edit-item"
                  icon={<EditIcon />}
                  label="Edit"
                  onClick={onEditClick}
                />,
              ]
            : []),
          ...(deleteOne
            ? [
                <GridActionsCellItem
                  key="delete-item"
                  icon={<DeleteIcon />}
                  label="Delete"
                  onClick={handleItemDelete(id)}
                />,
              ]
            : []),
        ],
      },
    ];
  }, [deleteOne, fields, handleItemDelete, onEditClick]);

  return (
    <Stack sx={{ flex: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Tooltip title="Reload data" placement="right" enterDelay={1000}>
          <div>
            <IconButton aria-label="refresh" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </div>
        </Tooltip>
        {onCreateClick ? (
          <Button variant="contained" onClick={onCreateClick} startIcon={<AddIcon />}>
            Create New
          </Button>
        ) : null}
      </Stack>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <DataGridSlot
          rows={rowsState.rows}
          rowCount={rowsState.rowCount}
          columns={columns}
          pagination
          sortingMode="server"
          filterMode="server"
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
          onSortModelChange={setSortModel}
          onFilterModelChange={setFilterModel}
          onRowClick={handleRowClick}
          loading={isLoading}
          initialState={initialState}
          slots={{ toolbar: GridToolbar }}
          {...slotProps?.dataGrid}
        />
        {error && (
          <ErrorOverlay>
            <Typography variant="body1">{error.message}</Typography>
          </ErrorOverlay>
        )}
      </Box>
    </Stack>
  );
}

List.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Fields to show.
   */
  fields: PropTypes.arrayOf(PropTypes.object).isRequired,
  /**
   * Initial number of rows to show per page.
   * @default 100
   */
  initialPageSize: PropTypes.number,
  /**
   * Methods to interact with server-side data.
   */
  methods: PropTypes.shape({
    deleteOne: PropTypes.func,
    getMany: PropTypes.func.isRequired,
  }).isRequired,
  /**
   * Callback fired when the "Create" button is clicked.
   */
  onCreateClick: PropTypes.func,
  /**
   * Callback fired when the "Create" button is clicked.
   */
  onEditClick: PropTypes.func,
  /**
   * Callback fired when a row is clicked. Not called if the target clicked is an interactive element added by the built-in columns.
   */
  onRowClick: PropTypes.func,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.shape({
    dataGrid: PropTypes.object,
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: PropTypes.shape({
    dataGrid: PropTypes.elementType,
  }),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
} as any;

export { List };
