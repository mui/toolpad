'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
  gridClasses,
} from '@mui/x-data-grid';
import type { DataGridProProps } from '@mui/x-data-grid-pro';
import type { DataGridPremiumProps } from '@mui/x-data-grid-premium';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import invariant from 'invariant';
import { useDialogs } from '../useDialogs';
import { useNotifications } from '../useNotifications';
import { DataModel, DataModelId, DataSource } from './shared';
import { CrudContext, RouterContext, WindowContext } from '../shared/context';

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

export interface ListSlotProps {
  dataGrid?: Partial<DataGridProps | DataGridProProps | DataGridPremiumProps>;
}

export interface ListSlots {
  /**
   * The DataGrid component used to list the items.
   * @default DataGrid
   */
  dataGrid?:
    | React.JSXElementConstructor<DataGridProps>
    | React.JSXElementConstructor<DataGridProProps>
    | React.JSXElementConstructor<DataGridPremiumProps>;
}

export interface ListProps<D extends DataModel> {
  /**
   * Server-side data source.
   */
  dataSource?: DataSource<D> & Required<Pick<DataSource<D>, 'getMany'>>;
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
  onCreateClick?: () => void;
  /**
   * Callback fired when the "Edit" button is clicked.
   */
  onEditClick?: (id: DataModelId) => void;
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
/**
 *
 * Demos:
 *
 * - [Crud](https://mui.com/toolpad/core/react-crud/)
 *
 * API:
 *
 * - [List API](https://mui.com/toolpad/core/api/list)
 */
function List<D extends DataModel>(props: ListProps<D>) {
  const { initialPageSize = 100, onRowClick, onCreateClick, onEditClick, slots, slotProps } = props;

  const crudContext = React.useContext(CrudContext);
  const dataSource = (props.dataSource ?? crudContext.dataSource) as Exclude<
    typeof props.dataSource,
    undefined
  >;

  invariant(dataSource, 'No data source found.');

  const { fields, ...methods } = dataSource;
  const { getMany, deleteOne } = methods;

  const routerContext = React.useContext(RouterContext);
  const appWindowContext = React.useContext(WindowContext);

  const appWindow = appWindowContext ?? window;

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [rowsState, setRowsState] = React.useState<{ rows: D[]; rowCount: number }>({
    rows: [],
    rowCount: 0,
  });

  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: routerContext?.searchParams.get('page')
      ? Number(routerContext?.searchParams.get('page'))
      : 0,
    pageSize: routerContext?.searchParams.get('pageSize')
      ? Number(routerContext?.searchParams.get('pageSize'))
      : initialPageSize,
  });
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>(
    routerContext?.searchParams.get('filter')
      ? JSON.parse(routerContext?.searchParams.get('filter') ?? '')
      : { items: [] },
  );
  const [sortModel, setSortModel] = React.useState<GridSortModel>(
    routerContext?.searchParams.get('sort')
      ? JSON.parse(routerContext?.searchParams.get('sort') ?? '')
      : [],
  );

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const url = new URL(appWindow.location.href);

    url.searchParams.set('page', String(paginationModel.page));
    url.searchParams.set('pageSize', String(paginationModel.pageSize));

    if (!appWindow.frameElement) {
      appWindow.history.pushState({}, '', url);
    }
  }, [appWindow, paginationModel.page, paginationModel.pageSize]);

  React.useEffect(() => {
    const url = new URL(appWindow.location.href);

    if (
      filterModel.items.length > 0 ||
      (filterModel.quickFilterValues && filterModel.quickFilterValues.length > 0)
    ) {
      url.searchParams.set('filter', JSON.stringify(filterModel));
    } else {
      url.searchParams.delete('filter');
    }

    if (!appWindow.frameElement) {
      appWindow.history.pushState({}, '', url);
    }
  }, [appWindow, filterModel]);

  React.useEffect(() => {
    const url = new URL(appWindow.location.href);

    if (sortModel.length > 0) {
      url.searchParams.set('sort', JSON.stringify(sortModel));
    } else {
      url.searchParams.delete('sort');
    }

    if (!appWindow.frameElement) {
      appWindow.history.pushState({}, '', url);
    }
  }, [appWindow, sortModel]);

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

  const handleItemEdit = React.useCallback(
    (itemId: DataModelId) => () => {
      if (onEditClick) {
        onEditClick(itemId);
      }
    },
    [onEditClick],
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
            autoHideDuration: 3000,
          });
          loadData();
        } catch (deleteError) {
          notifications.show(`Failed to delete item. Reason: ${(deleteError as Error).message}`, {
            severity: 'error',
            autoHideDuration: 3000,
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
    return [
      ...(fields.map((field) =>
        field.type === 'longString' ? { ...field, type: 'string' } : field,
      ) as GridColDef[]),
      {
        field: 'actions',
        type: 'actions',
        flex: 1,
        align: 'right',
        getActions: ({ id }) => [
          ...(onEditClick
            ? [
                <GridActionsCellItem
                  key="edit-item"
                  icon={<EditIcon />}
                  label="Edit"
                  onClick={handleItemEdit(id)}
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
  }, [deleteOne, fields, handleItemDelete, handleItemEdit, onEditClick]);

  return (
    <Stack sx={{ flex: 1, width: '100%' }}>
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
      <Box sx={{ flex: 1, position: 'relative', width: '100%' }}>
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
          // Prevent type conflicts if slotProps don't match DataGrid used for dataGrid slot
          {...(slotProps?.dataGrid as Record<string, unknown>)}
          sx={{
            [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
              outline: 'transparent',
            },
            [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]: {
              outline: 'none',
            },
            [`& .${gridClasses.row}:hover`]: {
              cursor: 'pointer',
            },
            ...slotProps?.dataGrid?.sx,
          }}
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
   * Server-side data source.
   */
  dataSource: PropTypes.object,
  /**
   * Initial number of rows to show per page.
   * @default 100
   */
  initialPageSize: PropTypes.number,
  /**
   * Callback fired when the "Create" button is clicked.
   */
  onCreateClick: PropTypes.func,
  /**
   * Callback fired when the "Edit" button is clicked.
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
} as any;

export { List };
