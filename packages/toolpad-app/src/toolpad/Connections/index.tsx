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
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
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
} from '../../types';
import { errorFrom } from '../../utils/errors';
import FlexFill from '../../components/FlexFill';
import dataSources from '../../toolpadDataSources/client';
import { ExactEntriesOf } from '../../utils/types';
import { ConnectionContextProvider } from '../../toolpadDataSources/context';

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
  dataSourceId: string | null;
  params: P | null;
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
  onStateChange: (
    newState: DialogState<P> | ((oldState: DialogState<P>) => DialogState<P>),
  ) => void;
}

function CreateConnectionDialog<P>({
  state,
  onStateChange,
  ...props
}: CreateConnectionDialogProps<P>) {
  const createConnectionMutation = client.useMutation('createConnection');
  const [dataSourceId, setDataSourceId] = React.useState('');

  const handleClose = React.useCallback(() => {
    onStateChange((old) => ({ ...old, open: false }));
  }, [onStateChange]);

  const handleDatasourceSelected = React.useCallback(() => {
    onStateChange((old) => ({ ...old, dataSourceId, params: null }));
  }, [onStateChange, dataSourceId]);

  const handleSave = React.useCallback(
    async ({ name, params, secrets }: ConnectionEditorModel<P>) => {
      await createConnectionMutation.mutateAsync([
        name,
        {
          datasource: dataSourceId,
          params,
          secrets,
        },
      ]);
      client.invalidateQueries('getConnections');
      onStateChange((old) => ({ ...old, open: false }));
    },
    [createConnectionMutation, dataSourceId, onStateChange],
  );

  const dataSource = getDataSource<P>(dataSourceId);

  const connectionEditorContext = React.useMemo(
    () => ({ appId: null, dataSourceId, connectionId: null }),
    [dataSourceId],
  );

  const model = React.useMemo(
    () => ({
      name: 'new connection',
      params: state.params,
      secrets: {},
    }),
    [state.params],
  );

  return (
    <Dialog fullWidth open={state.open} onClose={handleClose} {...props}>
      {state.dataSourceId ? (
        <React.Fragment>
          <DialogTitle>Create a new Connection</DialogTitle>

          {dataSource ? (
            <ConnectionContextProvider value={connectionEditorContext}>
              <ConnectionParamsEditor<P>
                dataSource={dataSource}
                value={model}
                onChange={handleSave}
                onClose={handleClose}
              />
            </ConnectionContextProvider>
          ) : (
            <DialogContent>Unknown data source type &quot;{state.dataSourceId}&quot;</DialogContent>
          )}
        </React.Fragment>
      ) : (
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
      )}
    </Dialog>
  );
}

export interface AppDeleteDialogProps {
  app: ConnectionMeta | null;
  onClose: () => void;
}

function AppDeleteDialog({ app, onClose }: AppDeleteDialogProps) {
  const latestApp = useLatest(app);
  const deleteAppMutation = client.useMutation('deleteApp');

  const handleClose = React.useCallback(
    async (confirmed: boolean) => {
      if (confirmed && app) {
        await deleteAppMutation.mutateAsync([app.id]);
        await client.invalidateQueries('getApps');
      }
      onClose();
    },
    [app, deleteAppMutation, onClose],
  );

  return (
    <ConfirmDialog
      open={!!app}
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
  app?: ConnectionMeta;
  editing?: boolean;
  setEditing: (editing: boolean) => void;
  loading?: boolean;
}

function AppNameEditable({ app, editing, setEditing, loading }: AppNameEditableProps) {
  const [appRenameError, setAppRenameError] = React.useState<Error | null>(null);
  const appNameInput = React.useRef<HTMLInputElement | null>(null);
  const [appName, setAppName] = React.useState<string>(app?.name || '');

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
      if (app?.id) {
        try {
          await client.mutation.updateApp(app.id, { name });
          await client.invalidateQueries('getApps');
        } catch (rawError) {
          setAppRenameError(errorFrom(rawError));
          setEditing(true);
        }
      }
    },
    [app?.id, setEditing],
  );

  return loading ? (
    <Skeleton />
  ) : (
    <EditableText
      defaultValue={app?.name}
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

interface AppEditButtonProps {
  app?: ConnectionMeta;
}

function AppEditButton({ app }: AppEditButtonProps) {
  return (
    <Button size="small" component={Link} to={app ? `/app/${app.id}` : ''} disabled={!app}>
      Edit
    </Button>
  );
}

interface ConnectionOptionsProps {
  app?: ConnectionMeta;
  onRename: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

function AppOptions({ app, onRename, onDelete, onDuplicate }: ConnectionOptionsProps) {
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
      <IconButton {...buttonProps} aria-label="Connection menu" disabled={!app}>
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

interface AppCardProps {
  app?: ConnectionMeta;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

function AppCard({ app, onDelete, onDuplicate }: AppCardProps) {
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
          <AppOptions
            app={app}
            onRename={handleRename}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        }
        disableTypography
        subheader={
          <Typography variant="body2" color="text.secondary">
            {app ? (
              <Tooltip title={app.editedAt.toLocaleString('short')}>
                <span>Edited {getReadableDuration(app.editedAt)}</span>
              </Tooltip>
            ) : (
              <Skeleton />
            )}
          </Typography>
        }
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <AppNameEditable
          app={app}
          editing={editingName}
          setEditing={setEditingName}
          loading={Boolean(!app)}
        />
      </CardContent>
      <CardActions>
        <AppEditButton app={app} />
      </CardActions>
    </Card>
  );
}

interface AppRowProps {
  app?: ConnectionMeta;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

function AppRow({ app, onDelete, onDuplicate }: AppRowProps) {
  const [editingName, setEditingName] = React.useState<boolean>(false);

  const handleRename = React.useCallback(() => {
    setEditingName(true);
  }, []);

  return (
    <TableRow hover role="row">
      <TableCell component="th" scope="row">
        <AppNameEditable
          loading={Boolean(!app)}
          app={app}
          editing={editingName}
          setEditing={setEditingName}
        />
        <Typography variant="caption">
          {app ? `Edited ${getReadableDuration(app.editedAt)}` : <Skeleton />}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={1} justifyContent={'flex-end'}>
          <AppEditButton app={app} />
          <AppOptions
            app={app}
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
  setDeletedApp: (app: ConnectionMeta) => void;
  duplicateApp: (app: ConnectionMeta) => void;
}

function ConnectionsGridView({
  loading,
  connections,
  setDeletedApp,
  duplicateApp,
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
          return <AppCard />;
        }
        if (connections.length <= 0) {
          return 'No connections yet';
        }
        return connections.map((app) => {
          return (
            <AppCard
              key={app.id}
              app={app}
              onDelete={() => setDeletedApp(app)}
              onDuplicate={() => duplicateApp(app)}
            />
          );
        });
      })()}
    </Box>
  );
}

function ConnectionsListView({
  loading,
  connections,
  setDeletedApp,
  duplicateApp,
}: ConnectionsViewProps) {
  return (
    <Table aria-label="apps list" size="medium">
      <TableBody>
        {(() => {
          if (loading) {
            return <AppRow />;
          }
          if (connections.length <= 0) {
            return (
              <TableRow>
                <TableCell>No connections yet</TableCell>
              </TableRow>
            );
          }
          return connections.map((app) => {
            return (
              <AppRow
                key={app.id}
                app={app}
                onDelete={() => setDeletedApp(app)}
                onDuplicate={() => duplicateApp(app)}
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
    error,
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

  // TODO: reducer
  const [createDialogState, setCreateDialogState] = React.useState<DialogState<any>>({
    open: false,
    dataSourceId: null,
    params: null,
  });

  const handleOpenDialog = React.useCallback(() => {
    setCreateDialogState((old) => ({ ...old, dataSourceId: null, open: true }));
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
        {error ? (
          <ErrorAlert error={error} />
        ) : (
          <Box sx={{ flex: 1, overflow: 'auto', px: 5 }}>
            <ConnectionsView
              connections={connections}
              loading={isLoading}
              setDeletedApp={setDeletedApp}
              duplicateApp={duplicateApp}
            />
          </Box>
        )}
        <AppDeleteDialog app={deletedApp} onClose={() => setDeletedApp(null)} />
      </Box>

      <CreateConnectionDialog state={createDialogState} onStateChange={setCreateDialogState} />
    </ToolpadHomeShell>
  );
}
