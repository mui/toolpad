'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import invariant from 'invariant';
import dayjs from 'dayjs';
import { useDialogs } from '../useDialogs';
import { useNotifications } from '../useNotifications';
import { useLocaleText } from '../AppProvider/LocalizationProvider';
import { CrudContext } from '../shared/context';
import { DataSourceCache } from './cache';
import { useCachedDataSource } from './useCachedDataSource';
import type { DataField, DataModel, DataModelId, DataSource } from './types';
import { CRUD_DEFAULT_LOCALE_TEXT, type CRUDLocaleText } from './localeText';

export interface ShowProps<D extends DataModel> {
  id: DataModelId;
  /**
   * Server-side data source.
   */
  dataSource?: DataSource<D> & Required<Pick<DataSource<D>, 'getOne'>>;
  /**
   * Callback fired when the "Edit" button is clicked.
   */
  onEditClick?: (id: DataModelId) => void;
  /**
   * Callback fired when the item is successfully deleted.
   */
  onDelete?: (id: DataModelId) => void;
  /**
   * Cache for the data source.
   */
  dataSourceCache?: DataSourceCache | null;
  /**
   * Locale text for CRUD Show component.
   */
  localeText?: CRUDLocaleText;
}

/**
 *
 * Demos:
 *
 * - [Crud](https://mui.com/toolpad/core/react-crud/)
 *
 * API:
 *
 * - [Show API](https://mui.com/toolpad/core/api/show)
 */
function Show<D extends DataModel>(props: ShowProps<D>) {
  const { id, onEditClick, onDelete, dataSourceCache, localeText: propsLocaleText } = props;

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
  const { getOne, deleteOne } = methods;

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [data, setData] = React.useState<D | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const [hasDeleted, setHasDeleted] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const showData = await getOne(id);
      setData(showData);
    } catch (showDataError) {
      setError(showDataError as Error);
    }
    setIsLoading(false);
  }, [getOne, id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleItemEdit = React.useCallback(() => {
    if (onEditClick) {
      onEditClick(id);
    }
  }, [id, onEditClick]);

  const handleItemDelete = React.useCallback(async () => {
    const confirmed = await dialogs.confirm(localeText.deleteConfirmMessage, {
      title: localeText.deleteConfirmTitle,
      severity: 'error',
      okText: 'Delete',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      setIsLoading(true);
      try {
        await deleteOne?.(id);

        if (onDelete) {
          onDelete(id);
        }

        notifications.show(localeText.deleteSuccessMessage, {
          severity: 'success',
          autoHideDuration: 3000,
        });

        setHasDeleted(true);
      } catch (deleteError) {
        notifications.show(`${localeText.deleteErrorMessage} ${(deleteError as Error).message}`, {
          severity: 'error',
          autoHideDuration: 3000,
        });
      }
      setIsLoading(false);
    }
  }, [
    deleteOne,
    dialogs,
    id,
    localeText.deleteConfirmMessage,
    localeText.deleteConfirmTitle,
    localeText.deleteErrorMessage,
    localeText.deleteSuccessMessage,
    notifications,
    onDelete,
  ]);

  const renderField = React.useCallback(
    (showField: DataField) => {
      if (!data) {
        return '…';
      }

      const { field, type } = showField;
      const fieldValue = data[field];

      if (type === 'boolean') {
        return fieldValue ? 'Yes' : 'No';
      }
      if (type === 'date') {
        return fieldValue ? dayjs(fieldValue as string).format('MMMM D, YYYY') : '-';
      }
      if (type === 'dateTime') {
        return fieldValue ? dayjs(fieldValue as string).format('MMMM D, YYYY h:mm A') : '-';
      }

      return fieldValue ? String(fieldValue) : '-';
    },
    [data],
  );

  const renderShow = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            m: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      );
    }

    if (hasDeleted) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">This item has been deleted.</Alert>
        </Box>
      );
    }

    return data ? (
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          {fields
            .filter(({ type }) => type !== 'actions' && type !== 'custom')
            .map((showField) => {
              const { field, headerName } = showField;

              return (
                <Grid key={field} size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ px: 2, py: 1 }}>
                    <Typography variant="overline">{headerName}</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {renderField(showField)}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {onEditClick ? (
            <Button variant="contained" startIcon={<EditIcon />} onClick={handleItemEdit}>
              Edit
            </Button>
          ) : null}
          {deleteOne ? (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleItemDelete}
            >
              Delete
            </Button>
          ) : null}
        </Stack>
      </Box>
    ) : null;
  }, [
    data,
    deleteOne,
    error,
    fields,
    handleItemDelete,
    handleItemEdit,
    hasDeleted,
    isLoading,
    onEditClick,
    renderField,
  ]);

  return <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>{renderShow}</Box>;
}

Show.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Server-side data source.
   */
  dataSource: PropTypes.object,
  /**
   * Cache for the data source.
   */
  dataSourceCache: PropTypes.shape({
    cache: PropTypes.object.isRequired,
    clear: PropTypes.func.isRequired,
    get: PropTypes.func.isRequired,
    set: PropTypes.func.isRequired,
    ttl: PropTypes.number.isRequired,
  }),
  /**
   * @ignore
   */
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  /**
   * Callback fired when the item is successfully deleted.
   */
  onDelete: PropTypes.func,
  /**
   * Callback fired when the "Edit" button is clicked.
   */
  onEditClick: PropTypes.func,
} as any;

export { Show };
