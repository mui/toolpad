'use client';
import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDialogs } from '../useDialogs';
import { useNotifications } from '../useNotifications';
import { CRUDFields, DataModel, DataModelId } from './shared';

export interface ShowProps<D extends DataModel> {
  id: DataModelId;
  /**
   * Fields to show.
   */
  fields: CRUDFields;
  /**
   * Methods to interact with server-side data.
   */
  methods: {
    getOne: (id: DataModelId) => Promise<D>;
    deleteOne?: (id: DataModelId) => Promise<void>;
  };
  /**
   * Callback fired when the "Edit" button is clicked.
   */
  onEditClick?: ButtonProps['onClick'];
  /**
   * Callback fired when the item is successfully deleted.
   */
  onDelete?: (id: DataModelId) => void;
}

function Show<D extends DataModel>(props: ShowProps<D>) {
  const { id, fields, methods, onEditClick, onDelete } = props;
  const { getOne, deleteOne } = methods;

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [data, setData] = React.useState<D | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

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

          if (onDelete) {
            onDelete(itemId);
          }

          notifications.show('Item deleted successfully.', {
            severity: 'success',
          });
        } catch (deleteError) {
          notifications.show(`Failed to delete item. Reason: ${(deleteError as Error).message}`, {
            severity: 'error',
          });
        }
        setIsLoading(false);
      }
    },
    [deleteOne, dialogs, notifications, onDelete],
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
      return <Alert severity="error">{error.message}</Alert>;
    }

    return data ? (
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          {fields.map((field) => (
            <Grid key={field.field} size={6}>
              <Paper sx={{ px: 2, py: 1 }}>
                <Typography variant="overline">{field.headerName}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {String(data[field.field])}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {onEditClick ? (
            <Button variant="contained" startIcon={<EditIcon />} onClick={onEditClick}>
              Edit
            </Button>
          ) : null}
          {deleteOne ? (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleItemDelete(id)}
            >
              Delete
            </Button>
          ) : null}
        </Stack>
      </Box>
    ) : null;
  }, [data, deleteOne, error, fields, handleItemDelete, id, isLoading, onEditClick]);

  return <Box sx={{ display: 'flex', flex: 1 }}>{renderShow}</Box>;
}

export { Show };
