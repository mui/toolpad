'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
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
  gridClasses,
} from '@mui/x-data-grid';
import type { DataGridProProps } from '@mui/x-data-grid-pro';
import type { DataGridPremiumProps } from '@mui/x-data-grid-premium';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import invariant from 'invariant';
import { useDialogs } from '../useDialogs';
import { useNotifications } from '../useNotifications';
import { Link as ToolpadLink } from '../shared/Link';
import { NoSsr } from '../shared/NoSsr';
import { CrudContext, RouterContext, WindowContext } from '../shared/context';
import { useLocaleText } from '../AppProvider/LocalizationProvider';
import { DataSourceCache } from './cache';
import { useCachedDataSource } from './useCachedDataSource';
import type { DataModel, DataModelId, DataSource } from './types';
import { CRUD_DEFAULT_LOCALE_TEXT, type CRUDLocaleText } from './localeText';

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
   * Server-side [data source](https://mui.com/toolpad/core/react-crud/#data-sources).
   */
  dataSource?: DataSource<D> & Required<Pick<DataSource<D>, 'getMany'>>;
  /**
   * Initial number of rows to show per page.
   * @default 100
   */
  initialPageSize?: number;
  /**
   * Function that returns the path that each row links to from the `id` cell.
   * @default (id) => `${String(id)}`
   */
  getRowIdLinkPath?: ((id: DataModelId) => string) | null;
  /**
   * Callback fired when the "Create" button is clicked.
   */
  onCreateClick?: () => void;
  /**
   * Callback fired when the "Edit" button is clicked.
   */
  onEditClick?: (id: DataModelId) => void;
  /**
   * Callback fired when the item is successfully deleted.
   */
  onDelete?: (id: DataModelId) => void;
  /**
   * [Cache](https://mui.com/toolpad/core/react-crud/#data-caching) for the data source.
   */
  dataSourceCache?: DataSourceCache | null;
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
  /**
   * Locale text for the component.
   */
  localeText?: CRUDLocaleText;
}

/**
 *
 * Demos:
 *
 * - [CRUD](https://mui.com/toolpad/core/react-crud/)
 *
 * API:
 *
 * - [List API](https://mui.com/toolpad/core/api/list)
 */
function List<D extends DataModel>(props: ListProps<D>) {
  const {
    initialPageSize = 100,
    getRowIdLinkPath = (id) => `${String(id)}`,
    onCreateClick,
    onEditClick,
    onDelete,
    dataSourceCache,
    slots,
    slotProps,
    localeText: propsLocaleText,
  } = props;

  const globalLocaleText = useLocaleText();
  const localeText = { ...CRUD_DEFAULT_LOCALE_TEXT, ...globalLocaleText, ...propsLocaleText };

  const crudContext = React.useContext(CrudContext);
  const dataSource = (props.dataSource ?? crudContext.dataSource) as NonNullable<
    typeof props.dataSource
  >;

  invariant(dataSource, 'No data source found.');

  const cache = React.useMemo(() => {
    const manualCache = dataSourceCache ?? crudContext.dataSourceCache;
    return typeof manualCache !== 'undefined' ? manualCache : new DataSourceCache();
  }, [crudContext.dataSourceCache, dataSourceCache]);
  const cachedDataSource = useCachedDataSource<D>(dataSource, cache) as NonNullable<
    typeof props.dataSource
  >;

  const { fields, validate, ...methods } = cachedDataSource;
  const { getMany, deleteOne } = methods;

  const routerContext = React.useContext(RouterContext);
  const appWindowContext = React.useContext(WindowContext);

  const appWindow = appWindowContext ?? (typeof window !== 'undefined' ? window : null);

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
    if (appWindow) {
      const url = new URL(appWindow.location.href);

      url.searchParams.set('page', String(paginationModel.page));
      url.searchParams.set('pageSize', String(paginationModel.pageSize));

      if (!appWindow.frameElement) {
        appWindow.history.pushState({}, '', url);
      }
    }
  }, [appWindow, paginationModel.page, paginationModel.pageSize]);

  React.useEffect(() => {
    if (appWindow) {
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
    }
  }, [appWindow, filterModel]);

  React.useEffect(() => {
    if (appWindow) {
      const url = new URL(appWindow.location.href);

      if (sortModel.length > 0) {
        url.searchParams.set('sort', JSON.stringify(sortModel));
      } else {
        url.searchParams.delete('sort');
      }

      if (!appWindow.frameElement) {
        appWindow.history.pushState({}, '', url);
      }
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
      cache?.clear();
      loadData();
    }
  }, [cache, isLoading, loadData]);

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
      const confirmed = await dialogs.confirm(localeText.deleteConfirmMessage, {
        title: localeText.deleteConfirmTitle,
        severity: 'error',
        okText: localeText.deleteConfirmLabel,
        cancelText: localeText.deleteCancelLabel,
      });

      if (confirmed) {
        setIsLoading(true);
        try {
          await deleteOne?.(itemId);

          if (onDelete) {
            onDelete(itemId);
          }

          notifications.show(localeText.deleteSuccessMessage, {
            severity: 'success',
            autoHideDuration: 3000,
          });
          loadData();
        } catch (deleteError) {
          notifications.show(`${localeText.deleteErrorMessage} ${(deleteError as Error).message}`, {
            severity: 'error',
            autoHideDuration: 3000,
          });
        }
        setIsLoading(false);
      }
    },
    [
      deleteOne,
      dialogs,
      loadData,
      localeText.deleteCancelLabel,
      localeText.deleteConfirmLabel,
      localeText.deleteConfirmMessage,
      localeText.deleteConfirmTitle,
      localeText.deleteErrorMessage,
      localeText.deleteSuccessMessage,
      notifications,
      onDelete,
    ],
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
      ...fields.map((column) => ({
        ...column,
        renderCell:
          column.renderCell ??
          (({ id, field, formattedValue }) =>
            field === 'id' && getRowIdLinkPath ? (
              <Link
                href={getRowIdLinkPath(id)}
                component={ToolpadLink}
                underline="hover"
                color="primary"
              >
                <Box
                  sx={{
                    flex: 1,
                  }}
                >
                  {formattedValue}
                  <OpenInNewIcon sx={{ fontSize: 'inherit' }} />
                </Box>
              </Link>
            ) : (
              formattedValue
            )),
      })),
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
                  label={localeText.editLabel}
                  onClick={handleItemEdit(id)}
                />,
              ]
            : []),
          ...(deleteOne
            ? [
                <GridActionsCellItem
                  key="delete-item"
                  icon={<DeleteIcon />}
                  label={localeText.deleteLabel}
                  onClick={handleItemDelete(id)}
                />,
              ]
            : []),
        ],
      },
    ] as GridColDef[];
  }, [
    deleteOne,
    fields,
    getRowIdLinkPath,
    handleItemDelete,
    handleItemEdit,
    localeText.deleteLabel,
    localeText.editLabel,
    onEditClick,
  ]);

  return (
    <Stack sx={{ flex: 1, width: '100%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Tooltip title={localeText.reloadButtonLabel} placement="right" enterDelay={1000}>
          <div>
            <IconButton aria-label="refresh" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </div>
        </Tooltip>
        {onCreateClick ? (
          <Button variant="contained" onClick={onCreateClick} startIcon={<AddIcon />}>
            {localeText.createNewButtonLabel}
          </Button>
        ) : null}
      </Stack>
      <Box sx={{ flex: 1, position: 'relative', width: '100%' }}>
        {/* Use NoSsr to prevent issue https://github.com/mui/mui-x/issues/17077 as DataGrid has no SSR support */}
        <NoSsr>
          <DataGridSlot
            rows={rowsState.rows}
            rowCount={rowsState.rowCount}
            columns={columns}
            pagination
            sortingMode="server"
            filterMode="server"
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            filterModel={filterModel}
            onFilterModelChange={setFilterModel}
            disableRowSelectionOnClick
            loading={isLoading}
            initialState={initialState}
            slots={{ toolbar: GridToolbar }}
            // Prevent type conflicts if slotProps don't match DataGrid used for dataGrid slot
            {...(slotProps?.dataGrid as Record<string, unknown>)}
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: 'transparent',
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                {
                  outline: 'none',
                },
              ...slotProps?.dataGrid?.sx,
            }}
          />
        </NoSsr>
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
   * Server-side [data source](https://mui.com/toolpad/core/react-crud/#data-sources).
   */
  dataSource: PropTypes.object,
  /**
   * [Cache](https://mui.com/toolpad/core/react-crud/#data-caching) for the data source.
   */
  dataSourceCache: PropTypes.shape({
    cache: PropTypes.object.isRequired,
    clear: PropTypes.func.isRequired,
    get: PropTypes.func.isRequired,
    set: PropTypes.func.isRequired,
    ttl: PropTypes.number.isRequired,
  }),
  /**
   * Function that returns the path that each row links to from the `id` cell.
   * @default (id) => `${String(id)}`
   */
  getRowIdLinkPath: PropTypes.func,
  /**
   * Initial number of rows to show per page.
   * @default 100
   */
  initialPageSize: PropTypes.number,
  /**
   * Locale text for the component.
   */
  localeText: PropTypes.object,
  /**
   * Callback fired when the "Create" button is clicked.
   */
  onCreateClick: PropTypes.func,
  /**
   * Callback fired when the item is successfully deleted.
   */
  onDelete: PropTypes.func,
  /**
   * Callback fired when the "Edit" button is clicked.
   */
  onEditClick: PropTypes.func,
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
    dataGrid: PropTypes.func,
  }),
} as any;

export { List };
