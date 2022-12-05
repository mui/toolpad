import * as React from 'react';
import {
  Button,
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Toolbar,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  CircularProgress,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGridPro, gridClasses, GridColumns } from '@mui/x-data-grid-pro';
import client from '../../api';
import useLatest from '../../utils/useLatest';
import ToolpadHomeShell from '../ToolpadHomeShell';
import getReadableDuration from '../../utils/readableDuration';
import EditableText from '../../components/EditableText';
import type { ConnectionMeta } from '../../server/data';
import useMenu from '../../utils/useMenu';
import useLocalStorageState from '../../utils/useLocalStorageState';
import ErrorAlert from '../AppEditor/PageEditor/ErrorAlert';
import { ConfirmDialog } from '../../components/SystemDialogs';
import config from '../../config';
import {
  AppTemplateId,
  ClientDataSource,
  ConnectionEditorModel,
  ConnectionEditorProps2,
  SecretsAction,
} from '../../types';
import { errorFrom } from '../../utils/errors';
import FlexFill from '../../components/FlexFill';
import dataSources from '../../toolpadDataSources/client';
import { ExactEntriesOf } from '../../utils/types';
import { ConnectionContextProvider } from '../../toolpadDataSources/context';

const USE_DATAGRID = false;

export const APP_TEMPLATE_OPTIONS: Map<
  AppTemplateId,
  {
    label: string;
    description: string;
  }
> = new Map([
  [
    'blank',
    {
      label: 'Blank page',
      description: 'Start with an empty canvas',
    },
  ],
  [
    'stats',
    {
      label: 'Statistics',
      description: 'Table with statistics data',
    },
  ],
  [
    'images',
    {
      label: 'Images',
      description: 'Fetch remote images',
    },
  ],
]);

export interface CreateAppDialogProps {
  open: boolean;
  onClose?: () => void;
}

function getDataSource<P>(dataSourceId: string): ClientDataSource<P, any> | null {
  const dataSource = dataSources[dataSourceId];
  return dataSource ?? null;
}

interface DialogState<P> {
  open: boolean;
  loading: boolean;
  saving: boolean;
  loadError: Error | null;
  saveError: Error | null;
  connectionId: string | null;
  dataSourceId: string | null;
  name: string;
  params: P | null;
  secrets: Record<string, SecretsAction>;
}

type DialogAction<P> =
  | { kind: 'DIALOG_OPEN'; connectionId?: string }
  | { kind: 'DIALOG_CLOSE' }
  | { kind: 'DATASOURCE_SELECTED'; dataSourceId: string }
  | { kind: 'DATASOURCE_SELECTED'; dataSourceId: string }
  | { kind: 'SAVE_STARTED' }
  | { kind: 'SAVE_FAILED'; error: Error }
  | {
      kind: 'CONNECTION_LOAD_SUCCESS';
      name: string;
      dataSourceId: string;
      params: P;
      secrets: Record<string, SecretsAction>;
    }
  | { kind: 'CONNECTION_LOAD_FAILED'; error: Error };

function dialogStateReducer<P>(state: DialogState<P>, action: DialogAction<P>): DialogState<P> {
  switch (action.kind) {
    case 'DIALOG_OPEN': {
      const loading = !!action.connectionId;
      return {
        open: true,
        loading,
        saving: false,
        connectionId: action.connectionId ?? null,
        dataSourceId: null,
        name: 'new connection',
        loadError: null,
        saveError: null,
        params: null,
        secrets: {},
      };
    }
    case 'DIALOG_CLOSE': {
      return { ...state, open: false, loading: false, saving: false };
    }
    case 'DATASOURCE_SELECTED': {
      return { ...state, dataSourceId: action.dataSourceId, params: null, secrets: {} };
    }
    case 'CONNECTION_LOAD_FAILED': {
      return { ...state, loading: false, loadError: action.error };
    }
    case 'CONNECTION_LOAD_SUCCESS': {
      return {
        ...state,
        loading: false,
        name: action.name,
        dataSourceId: action.dataSourceId,
        params: action.params,
        secrets: action.secrets,
      };
    }
    case 'SAVE_STARTED': {
      return { ...state, saving: true, saveError: null };
    }
    case 'SAVE_FAILED': {
      return { ...state, saving: false, saveError: action.error };
    }
    default:
      throw new Error(`Unknown dialog action "${(action as DialogAction<P>).kind}"`);
  }
}

interface ConnectionParamsEditorProps<P> extends ConnectionEditorProps2<P> {
  dataSource: ClientDataSource<P, any>;
}

function ConnectionParamsEditor<P>({ dataSource, ...props }: ConnectionParamsEditorProps<P>) {
  const { ConnectionParamsInput2 } = dataSource;
  return <ConnectionParamsInput2 {...props} />;
}

export interface CreateConnectionDialogProps<P> {
  state: DialogState<P>;
  dispatch: React.Dispatch<DialogAction<P>>;
}

function CreateConnectionDialog<P>({ state, dispatch, ...props }: CreateConnectionDialogProps<P>) {
  const [dataSourceId, setDataSourceId] = React.useState('');

  const handleClose = React.useCallback(() => {
    dispatch({ kind: 'DIALOG_CLOSE' });
  }, [dispatch]);

  const handleDatasourceSelected = React.useCallback(() => {
    dispatch({ kind: 'DATASOURCE_SELECTED', dataSourceId });
  }, [dispatch, dataSourceId]);

  const handleSave = React.useCallback(
    async ({ name, params, secrets }: ConnectionEditorModel<P>) => {
      dispatch({ kind: 'SAVE_STARTED' });
      try {
        if (state.connectionId) {
          await client.mutation.updateConnection(state.connectionId, { name, params, secrets });
        } else {
          await client.mutation.createConnection(name, {
            datasource: dataSourceId,
            params,
            secrets,
          });
        }
      } catch (error: unknown) {
        dispatch({ kind: 'SAVE_FAILED', error: errorFrom(error) });
      } finally {
        await client.refetchQueries('getConnections');
        dispatch({ kind: 'DIALOG_CLOSE' });
      }
    },
    [dataSourceId, dispatch, state.connectionId],
  );

  return (
    <Dialog fullWidth open={state.open} onClose={handleClose} {...props}>
      {(() => {
        if (state.loading) {
          return (
            <DialogContent>
              <CircularProgress />
            </DialogContent>
          );
        }
        if (state.loadError) {
          return (
            <DialogContent>
              <ErrorAlert error={state.loadError} />
            </DialogContent>
          );
        }

        if (state.dataSourceId) {
          const dataSource = state.dataSourceId ? getDataSource<P>(state.dataSourceId) : null;

          return (
            <React.Fragment>
              <DialogTitle>Create a new Connection</DialogTitle>

              {dataSource ? (
                <ConnectionParamsEditor<P>
                  dataSource={dataSource}
                  value={state}
                  onChange={handleSave}
                  onClose={handleClose}
                />
              ) : (
                <DialogContent>
                  Unknown data source type &quot;{state.dataSourceId}&quot;
                </DialogContent>
              )}
            </React.Fragment>
          );
        }

        return (
          <React.Fragment>
            <DialogTitle>Create a new Connection</DialogTitle>
            <DialogContent>
              <TextField
                select
                required
                sx={{ my: 1 }}
                fullWidth
                value={dataSourceId}
                label="Type"
                onChange={(event) => setDataSourceId(event.target.value)}
              >
                {(Object.entries(dataSources) as ExactEntriesOf<typeof dataSources>).map(
                  ([type, dataSourceDef]) =>
                    dataSourceDef && (
                      <MenuItem key={type} value={type}>
                        {dataSourceDef.displayName}
                      </MenuItem>
                    ),
                )}
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button color="inherit" variant="text" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleDatasourceSelected}>
                Continue
              </Button>
            </DialogActions>
          </React.Fragment>
        );
      })()}
    </Dialog>
  );
}

export interface AppDeleteDialogProps {
  connection: ConnectionMeta | null;
  onClose: () => void;
}

function AppDeleteDialog({ connection, onClose }: AppDeleteDialogProps) {
  const latestApp = useLatest(connection);
  const deleteAppMutation = client.useMutation('deleteConnection');

  const handleClose = React.useCallback(
    async (confirmed: boolean) => {
      if (confirmed && connection) {
        await deleteAppMutation.mutateAsync([connection.id]);
        await client.invalidateQueries('getConnections');
      }
      onClose();
    },
    [connection, deleteAppMutation, onClose],
  );

  return (
    <ConfirmDialog
      open={!!connection}
      onClose={handleClose}
      severity="error"
      okButton="Delete"
      loading={deleteAppMutation.isLoading}
    >
      Are you sure you want to delete application &quot;{latestApp?.name}&quot;
    </ConfirmDialog>
  );
}

interface AppNameEditableProps {
  connection?: ConnectionMeta;
  editing?: boolean;
  setEditing: (editing: boolean) => void;
  loading?: boolean;
}

function AppNameEditable({ connection, editing, setEditing, loading }: AppNameEditableProps) {
  const [appRenameError, setAppRenameError] = React.useState<Error | null>(null);
  const appNameInput = React.useRef<HTMLInputElement | null>(null);
  const [appName, setAppName] = React.useState<string>(connection?.name || '');

  const handleAppNameChange = React.useCallback(
    (newValue: string) => {
      setAppRenameError(null);
      setAppName(newValue);
    },
    [setAppName],
  );

  const handleAppRenameClose = React.useCallback(() => {
    setEditing(false);
    setAppRenameError(null);
  }, [setEditing]);

  const handleAppRenameSave = React.useCallback(
    async (name: string) => {
      if (connection?.id) {
        try {
          await client.mutation.updateApp(connection.id, { name });
          await client.invalidateQueries('getApps');
        } catch (rawError) {
          setAppRenameError(errorFrom(rawError));
          setEditing(true);
        }
      }
    },
    [connection?.id, setEditing],
  );

  return loading ? (
    <Skeleton />
  ) : (
    <EditableText
      defaultValue={connection?.name}
      editable={editing}
      helperText={appRenameError ? `An app named "${appName}" already exists` : null}
      error={!!appRenameError}
      onChange={handleAppNameChange}
      onClose={handleAppRenameClose}
      onSave={handleAppRenameSave}
      ref={appNameInput}
      sx={{
        width: '100%',
      }}
      value={appName}
      variant="subtitle1"
    />
  );
}

interface ConnectionOptionsProps {
  connection?: ConnectionMeta;
  onRename: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

function ConnectionOptions({
  connection,
  onRename,
  onDelete,
  onDuplicate,
}: ConnectionOptionsProps) {
  const { buttonProps, menuProps, onMenuClose } = useMenu();

  const handleRenameClick = React.useCallback(() => {
    onMenuClose();
    onRename();
  }, [onMenuClose, onRename]);

  const handleDeleteClick = React.useCallback(() => {
    onMenuClose();
    onDelete?.();
  }, [onDelete, onMenuClose]);

  const handleDuplicateClick = React.useCallback(() => {
    onMenuClose();
    onDuplicate?.();
  }, [onDuplicate, onMenuClose]);

  return (
    <React.Fragment>
      <IconButton {...buttonProps} aria-label="Connection menu" disabled={!connection}>
        <MoreVertIcon />
      </IconButton>
      <Menu {...menuProps}>
        <MenuItem onClick={handleRenameClick}>
          <ListItemIcon>
            <DriveFileRenameOutlineIcon />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicateClick}>
          <ListItemIcon>
            <ContentCopyOutlinedIcon />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}

interface ConnectionCardProps {
  connection?: ConnectionMeta;
  onDelete?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
}

function ConnectionCard({ connection, onDelete, onEdit, onDuplicate }: ConnectionCardProps) {
  const [editingName, setEditingName] = React.useState<boolean>(false);

  const handleRename = React.useCallback(() => {
    setEditingName(true);
  }, []);

  return (
    <Card
      role="article"
      sx={{
        gridColumn: 'span 1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <CardHeader
        action={
          <ConnectionOptions
            connection={connection}
            onRename={handleRename}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        }
        disableTypography
        subheader={
          <Typography variant="body2" color="text.secondary">
            {connection ? (
              <Tooltip title={connection.editedAt.toLocaleString('short')}>
                <span>Edited {getReadableDuration(connection.editedAt)}</span>
              </Tooltip>
            ) : (
              <Skeleton />
            )}
          </Typography>
        }
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <AppNameEditable
          connection={connection}
          editing={editingName}
          setEditing={setEditingName}
          loading={Boolean(!connection)}
        />
      </CardContent>
      <CardActions>
        <Button onClick={onEdit}>Edit</Button>
      </CardActions>
    </Card>
  );
}

interface ConnectionRowProps {
  connection?: ConnectionMeta;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onEdit?: () => void;
}

function ConnectionRow({ connection, onDelete, onDuplicate, onEdit }: ConnectionRowProps) {
  const [editingName, setEditingName] = React.useState<boolean>(false);

  const handleRename = React.useCallback(() => {
    setEditingName(true);
  }, []);

  return (
    <TableRow hover role="row">
      <TableCell component="th" scope="row">
        <AppNameEditable
          loading={Boolean(!connection)}
          connection={connection}
          editing={editingName}
          setEditing={setEditingName}
        />
        <Typography variant="caption">
          {connection ? `Edited ${getReadableDuration(connection.editedAt)}` : <Skeleton />}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={1} justifyContent={'flex-end'}>
          <Button onClick={onEdit}>Edit</Button>
          <ConnectionOptions
            connection={connection}
            onRename={handleRename}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        </Stack>
      </TableCell>
    </TableRow>
  );
}

interface ConnectionsViewProps {
  connections: ConnectionMeta[];
  loading?: boolean;
  onDeleteConnection: (connection: ConnectionMeta) => void;
  onEditConnection: (id: string) => void;
  onDuplicateConnection: (connection: ConnectionMeta) => void;
}

function ConnectionsGridView({
  loading,
  connections,
  onDeleteConnection,
  onEditConnection,
  onDuplicateConnection,
}: ConnectionsViewProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          lg: 'repeat(4, 1fr)',
          md: 'repeat(3, 1fr)',
          sm: 'repeat(2, fr)',
          xs: 'repeat(1, fr)',
        },
        gap: 2,
      }}
    >
      {(() => {
        if (loading) {
          return <ConnectionCard />;
        }
        if (connections.length <= 0) {
          return 'No connections yet';
        }
        return connections.map((connection) => {
          return (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onDelete={() => onDeleteConnection(connection)}
              onDuplicate={() => onDuplicateConnection(connection)}
              onEdit={() => onEditConnection(connection.id)}
            />
          );
        });
      })()}
    </Box>
  );
}

function NoConnectionsOverlay() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      No Connections
    </Box>
  );
}

function ConnectionsListView({
  loading,
  connections,
  onDeleteConnection,
  onEditConnection,
  onDuplicateConnection,
}: ConnectionsViewProps) {
  const columns = React.useMemo<GridColumns<ConnectionMeta>>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        hideable: false,
        renderCell(params) {
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography>{params.value}</Typography>
              <Typography variant="caption">
                Edited {getReadableDuration(params.row.editedAt)}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'actions',
        headerName: '',
        width: 120,
        align: 'center',
        hideable: false,
        renderCell(params) {
          return (
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              <Button onClick={() => onEditConnection(params.row.id)}>Edit</Button>
              <ConnectionOptions
                connection={params.row}
                onDelete={() => onDeleteConnection(params.row)}
                onDuplicate={() => onDuplicateConnection(params.row)}
                onRename={() => undefined}
              />
            </Box>
          );
        },
      },
    ],
    [onDeleteConnection, onDuplicateConnection, onEditConnection],
  );

  return USE_DATAGRID ? (
    <DataGridPro
      columns={columns}
      rows={connections}
      hideFooter
      disableColumnSelector
      rowHeight={80}
      components={{
        NoResultsOverlay: NoConnectionsOverlay,
        NoRowsOverlay: NoConnectionsOverlay,
      }}
      sx={{
        border: 'none',
        [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
          outline: 'none',
        },
        [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]: {
          outline: 'none',
        },
      }}
    />
  ) : (
    <Table aria-label="apps list" size="medium">
      <TableBody>
        {(() => {
          if (loading) {
            return <ConnectionRow />;
          }
          if (connections.length <= 0) {
            return (
              <TableRow>
                <TableCell>No connections yet</TableCell>
              </TableRow>
            );
          }
          return connections.map((connection) => {
            return (
              <ConnectionRow
                key={connection.id}
                connection={connection}
                onDelete={() => onDeleteConnection(connection)}
                onDuplicate={() => onDuplicateConnection(connection)}
                onEdit={() => onEditConnection(connection.id)}
              />
            );
          });
        })()}
      </TableBody>
    </Table>
  );
}

export default function Connections() {
  const {
    data: connections = [],
    isLoading,
    error: queryError,
  } = client.useQuery('getConnections', [], {
    enabled: !config.isDemo,
  });

  const [deletedApp, setDeletedApp] = React.useState<null | ConnectionMeta>(null);

  const [viewMode, setViewMode] = useLocalStorageState<string>('home-app-view-mode', 'list');

  const handleViewModeChange = React.useCallback(
    (event: React.MouseEvent, value: string) => setViewMode(value),
    [setViewMode],
  );

  const ConnectionsView = viewMode === 'list' ? ConnectionsListView : ConnectionsGridView;

  const duplicateAppMutation = client.useMutation('duplicateApp');

  const duplicateApp = React.useCallback(
    async (app: ConnectionMeta) => {
      if (app) {
        await duplicateAppMutation.mutateAsync([app.id, app.name]);
      }
      await client.invalidateQueries('getApps');
    },
    [duplicateAppMutation],
  );

  const [dialogState, dispatch] = React.useReducer(dialogStateReducer, {
    open: false,
    loading: false,
    saving: false,
    connectionId: null,
    dataSourceId: null,
    name: 'new connection',
    params: null,
    secrets: {},
    loadError: null,
    saveError: null,
  });

  const handleOpenDialog = React.useCallback(() => {
    dispatch({ kind: 'DIALOG_OPEN' });
  }, []);

  const handleEditConnection = React.useCallback(async (connectionId: string) => {
    dispatch({ kind: 'DIALOG_OPEN', connectionId });
    try {
      const connection = await client.query.getConnection(connectionId);
      if (!connection) {
        throw new Error(`Connection "${connectionId}" doesn't exist`);
      }
      dispatch({
        kind: 'CONNECTION_LOAD_SUCCESS',
        name: connection.name,
        dataSourceId: connection.datasource,
        params: connection.params,
        secrets: connection.secrets,
      });
    } catch (error: unknown) {
      dispatch({ kind: 'CONNECTION_LOAD_FAILED', error: errorFrom(error) });
    }
  }, []);

  return (
    <ToolpadHomeShell>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Toolbar variant="regular" disableGutters sx={{ gap: 2, px: 5, mt: 3, mb: 2 }}>
          <Typography sx={{ pl: 2 }} variant="h3">
            Connections
          </Typography>
          <FlexFill />
          <Button onClick={handleOpenDialog}>Create New</Button>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
          >
            <ToggleButton
              value="list"
              aria-label="list view"
              color={viewMode === 'list' ? 'primary' : undefined}
            >
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton
              value="grid"
              aria-label="grid view"
              color={viewMode === 'grid' ? 'primary' : undefined}
            >
              <GridViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
        {queryError ? (
          <ErrorAlert error={queryError} />
        ) : (
          <Box sx={{ flex: 1, overflow: 'auto', px: 5 }}>
            <ConnectionsView
              connections={connections}
              loading={isLoading}
              onDeleteConnection={setDeletedApp}
              onDuplicateConnection={duplicateApp}
              onEditConnection={handleEditConnection}
            />
          </Box>
        )}
        <AppDeleteDialog connection={deletedApp} onClose={() => setDeletedApp(null)} />
      </Box>

      <CreateConnectionDialog state={dialogState} dispatch={dispatch} />
    </ToolpadHomeShell>
  );
}
