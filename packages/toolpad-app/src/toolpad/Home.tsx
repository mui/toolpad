import * as React from 'react';
import {
  Alert,
  Button,
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Container,
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
import { LoadingButton } from '@mui/lab';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import DeleteIcon from '@mui/icons-material/Delete';
import client from '../api';
import DialogForm from '../components/DialogForm';
import type { Deployment } from '../../prisma/generated/client';
import useLatest from '../utils/useLatest';
import ToolpadShell from './ToolpadShell';
import getReadableDuration from '../utils/readableDuration';
import EditableText from '../components/EditableText';
import type { AppMeta } from '../server/data';

export interface CreateAppDialogProps {
  open: boolean;
  onClose: () => void;
}

function CreateAppDialog({ onClose, ...props }: CreateAppDialogProps) {
  const [name, setName] = React.useState('');

  const [dom, setDom] = React.useState('');

  const handleDomChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => setDom(event.target.value),
    [],
  );

  const createAppMutation = client.useMutation('createApp', {
    onSuccess: (app) => {
      window.location.href = `/_toolpad/app/${app.id}/editor`;
    },
  });

  return (
    <React.Fragment>
      <Dialog {...props} onClose={onClose}>
        <DialogForm
          onSubmit={(event) => {
            event.preventDefault();
            createAppMutation.mutate([name, { dom: dom.trim() ? JSON.parse(dom) : null }]);
          }}
        >
          <DialogTitle>Create a new MUI Toolpad App</DialogTitle>
          <DialogContent>
            <TextField
              sx={{ my: 1 }}
              autoFocus
              fullWidth
              label="name"
              value={name}
              error={createAppMutation.isError}
              helperText={createAppMutation.isError ? `An app named "${name}" already exists` : ''}
              onChange={(event) => {
                createAppMutation.reset();
                setName(event.target.value);
              }}
            />
            {process.env.TOOLPAD_CREATE_WITH_DOM ? (
              <TextField
                label="seed DOM"
                fullWidth
                multiline
                maxRows={10}
                value={dom}
                onChange={handleDomChange}
              />
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button
              color="inherit"
              variant="text"
              onClick={() => {
                setName('');
                createAppMutation.reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <LoadingButton type="submit" loading={createAppMutation.isLoading} disabled={!name}>
              Create
            </LoadingButton>
          </DialogActions>
        </DialogForm>
      </Dialog>
    </React.Fragment>
  );
}

export interface AppDeleteDialogProps {
  app: AppMeta | null;
  onClose: () => void;
}

function AppDeleteDialog({ app, onClose }: AppDeleteDialogProps) {
  const latestApp = useLatest(app);
  const deleteAppMutation = client.useMutation('deleteApp');

  const handleDeleteClick = React.useCallback(async () => {
    if (app) {
      await deleteAppMutation.mutateAsync([app.id]);
    }
    await client.invalidateQueries('getApps');
    onClose();
  }, [app, deleteAppMutation, onClose]);

  return (
    <Dialog open={!!app} onClose={onClose}>
      <DialogTitle>Confirm delete</DialogTitle>
      <DialogContent>
        Are you sure you want to delete application &quot;{latestApp?.name}&quot;
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="text" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          loading={deleteAppMutation.isLoading}
          onClick={handleDeleteClick}
          color="error"
        >
          Delete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

interface AppNameEditableProps {
  app?: AppMeta;
  editing?: boolean;
  setEditing: (editing: boolean) => void;
  loading?: boolean;
  description?: React.ReactNode;
}

function AppNameEditable({ app, editing, setEditing, loading, description }: AppNameEditableProps) {
  const [showAppRenameError, setShowAppRenameError] = React.useState<boolean>(false);
  const appNameInput = React.useRef<HTMLInputElement | null>(null);
  const [appName, setAppName] = React.useState<string>(app?.name || '');

  const handleAppNameChange = React.useCallback(
    (newValue: string) => {
      setShowAppRenameError(false);
      setAppName(newValue);
    },
    [setAppName],
  );

  const handleAppRenameClose = React.useCallback(() => {
    setEditing(false);
    setShowAppRenameError(false);
  }, [setEditing]);

  const handleAppRenameSave = React.useCallback(
    async (name: string) => {
      if (app?.id) {
        try {
          await client.mutation.updateApp(app.id, name);
          await client.invalidateQueries('getApps');
        } catch (err) {
          setShowAppRenameError(true);
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
      helperText={showAppRenameError ? `An app named "${appName}" already exists` : description}
      error={showAppRenameError}
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
  app?: AppMeta;
}

function AppEditButton({ app }: AppEditButtonProps) {
  return (
    <Button
      size="small"
      component="a"
      href={app ? `/_toolpad/app/${app.id}/editor` : ''}
      disabled={!app}
    >
      Edit
    </Button>
  );
}

interface AppOpenButtonProps {
  app?: AppMeta;
  activeDeployment?: Deployment;
}

function AppOpenButton({ app, activeDeployment }: AppOpenButtonProps) {
  const openDisabled = !app || !activeDeployment;
  let openButton = (
    <Button disabled={!app || !activeDeployment} component="a" href={app ? `deploy/${app.id}` : ''}>
      Open
    </Button>
  );

  if (openDisabled) {
    openButton = (
      <Tooltip title="The app hasn't been deployed yet">
        <span>{openButton}</span>
      </Tooltip>
    );
  }
  return openButton;
}

interface AppOptionsProps {
  menuOpen: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function AppOptions({ menuOpen, onClick }: AppOptionsProps) {
  return (
    <IconButton
      aria-label="settings"
      aria-controls={menuOpen ? 'basic-menu' : undefined}
      aria-haspopup="true"
      aria-expanded={menuOpen ? 'true' : undefined}
      onClick={onClick}
    >
      <MoreVertIcon />
    </IconButton>
  );
}

interface AppMenuProps {
  menuAnchorEl: HTMLElement | null;
  menuOpen: boolean;
  handleMenuClose: () => void;
  handleRenameClick: () => void;
  handleDeleteClick: () => void;
}

function AppMenu({
  menuAnchorEl,
  menuOpen,
  handleMenuClose,
  handleRenameClick,
  handleDeleteClick,
}: AppMenuProps) {
  return (
    <Menu
      id="basic-menu"
      anchorEl={menuAnchorEl}
      open={menuOpen}
      onClose={handleMenuClose}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
        dense: true,
      }}
    >
      {/* Using an onClick on a MenuItem causes accessibility issues, see: https://github.com/mui/material-ui/pull/30145 */}
      <MenuItem onClick={handleRenameClick}>
        <ListItemIcon>
          <DriveFileRenameOutlineIcon />
        </ListItemIcon>
        <ListItemText>Rename</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleDeleteClick}>
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText>Delete</ListItemText>
      </MenuItem>
    </Menu>
  );
}

interface AppCardProps {
  app?: AppMeta;
  activeDeployment?: Deployment;
  onDelete?: () => void;
}

function AppCard({ app, activeDeployment, onDelete }: AppCardProps) {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [editingName, setEditingName] = React.useState<boolean>(false);

  const menuOpen = Boolean(menuAnchorEl);

  const handleOptionsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = React.useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  const handleRenameClick = React.useCallback(() => {
    setMenuAnchorEl(null);
    setEditingName(true);
  }, []);

  const handleDeleteClick = React.useCallback(() => {
    setMenuAnchorEl(null);
    if (onDelete) {
      onDelete();
    }
  }, [onDelete]);

  return (
    <React.Fragment>
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
          action={<AppOptions menuOpen={menuOpen} onClick={handleOptionsClick} />}
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
          <AppOpenButton app={app} activeDeployment={activeDeployment} />
        </CardActions>
      </Card>
      <AppMenu
        menuAnchorEl={menuAnchorEl}
        menuOpen={menuOpen}
        handleMenuClose={handleMenuClose}
        handleRenameClick={handleRenameClick}
        handleDeleteClick={handleDeleteClick}
      />
    </React.Fragment>
  );
}

interface AppRowProps {
  app?: AppMeta;
  activeDeployment?: Deployment;
  onDelete?: () => void;
}

function AppRow({ app, activeDeployment, onDelete }: AppRowProps) {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  const menuOpen = Boolean(menuAnchorEl);

  const [editingName, setEditingName] = React.useState<boolean>(false);

  const handleOptionsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = React.useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  const handleRenameClick = React.useCallback(() => {
    setMenuAnchorEl(null);
    setEditingName(true);
  }, []);

  const handleDeleteClick = React.useCallback(() => {
    setMenuAnchorEl(null);
    if (onDelete) {
      onDelete();
    }
  }, [onDelete]);

  return (
    <React.Fragment>
      <TableRow hover role="row">
        <TableCell component="th" scope="row">
          <AppNameEditable
            loading={Boolean(!app)}
            app={app}
            editing={editingName}
            setEditing={setEditingName}
            description={app ? `Edited ${getReadableDuration(app.editedAt)}` : <Skeleton />}
          />
        </TableCell>
        <TableCell align="right">
          <Stack direction="row" spacing={1} justifyContent={'flex-end'}>
            <AppEditButton app={app} />
            <AppOpenButton app={app} activeDeployment={activeDeployment} />
            <AppOptions menuOpen={menuOpen} onClick={handleOptionsClick} />
          </Stack>
        </TableCell>
      </TableRow>
      <AppMenu
        menuAnchorEl={menuAnchorEl}
        menuOpen={menuOpen}
        handleMenuClose={handleMenuClose}
        handleRenameClick={handleRenameClick}
        handleDeleteClick={handleDeleteClick}
      />
    </React.Fragment>
  );
}

interface AppViewProps {
  apps: AppMeta[];
  status: string;
  activeDeploymentsByApp: { [appId: string]: Deployment } | null;
  error: unknown;
  setDeletedApp: (app: AppMeta) => void;
}

function AppsGridView({
  status,
  apps,
  activeDeploymentsByApp,
  error,
  setDeletedApp,
}: AppViewProps) {
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
        switch (status) {
          case 'loading':
            return <AppCard />;
          case 'error':
            return <Alert severity="error">{(error as Error)?.message}</Alert>;
          case 'success':
            return apps.length > 0
              ? apps.map((app) => {
                  const activeDeployment = activeDeploymentsByApp?.[app.id];
                  return (
                    <AppCard
                      key={app.id}
                      app={app}
                      activeDeployment={activeDeployment}
                      onDelete={() => setDeletedApp(app)}
                    />
                  );
                })
              : 'No apps yet';
          default:
            return <AppCard />;
        }
      })()}
    </Box>
  );
}

function AppsListView({
  status,
  apps,
  activeDeploymentsByApp,
  error,
  setDeletedApp,
}: AppViewProps) {
  return (
    <Table aria-label="apps list" size="medium">
      <TableBody>
        {(() => {
          switch (status) {
            case 'loading':
              return <AppRow />;
            case 'error':
              return <Alert severity="error">{(error as Error)?.message}</Alert>;
            case 'success':
              return apps.length > 0
                ? apps.map((app) => {
                    const activeDeployment = activeDeploymentsByApp?.[app.id];
                    return (
                      <AppRow
                        key={app.id}
                        app={app}
                        activeDeployment={activeDeployment}
                        onDelete={() => setDeletedApp(app)}
                      />
                    );
                  })
                : 'No apps yet';
            default:
              return '';
          }
        })()}
      </TableBody>
    </Table>
  );
}

export default function Home() {
  const { data: apps = [], status, error } = client.useQuery('getApps', []);
  const { data: activeDeployments } = client.useQuery('getActiveDeployments', []);

  const activeDeploymentsByApp = React.useMemo(() => {
    if (!activeDeployments) {
      return null;
    }
    return Object.fromEntries(
      activeDeployments.map((deployment) => [deployment.appId, deployment]),
    );
  }, [activeDeployments]);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  const [deletedApp, setDeletedApp] = React.useState<null | AppMeta>(null);

  const [viewMode, setViewMode] = React.useState<string>('list');

  const handleViewModeChange = React.useCallback((event: React.MouseEvent, value: string) => {
    setViewMode(value);
  }, []);

  const AppsView = viewMode === 'list' ? AppsListView : AppsGridView;

  return (
    <ToolpadShell>
      <AppDeleteDialog app={deletedApp} onClose={() => setDeletedApp(null)} />
      <Container>
        <Typography variant="h2">Apps</Typography>
        <CreateAppDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
        <Toolbar variant={'dense'} disableGutters sx={{ justifyContent: 'space-between' }}>
          <Button onClick={() => setCreateDialogOpen(true)}>Create New</Button>
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
        <AppsView
          apps={apps}
          status={status}
          error={error}
          activeDeploymentsByApp={activeDeploymentsByApp}
          setDeletedApp={setDeletedApp}
        />
      </Container>
    </ToolpadShell>
  );
}
