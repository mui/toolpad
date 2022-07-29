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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  Tooltip,
} from '@mui/material';
import * as React from 'react';
import { LoadingButton } from '@mui/lab';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import DeleteIcon from '@mui/icons-material/Delete';
import client from '../api';
import DialogForm from '../components/DialogForm';
import type { App, Deployment } from '../../prisma/generated/client';
import useLatest from '../utils/useLatest';
import ToolpadShell from './ToolpadShell';
import getReadableDuration from '../utils/readableDuration';
import EditableText from '../components/EditableText';

export interface CreateAppDialogProps {
  open: boolean;
  onClose: () => void;
}

function CreateAppDialog({ onClose, ...props }: CreateAppDialogProps) {
  const [name, setName] = React.useState('');
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
            createAppMutation.mutate([name]);
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
  app: App | null;
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

interface AppCardProps {
  app?: App;
  activeDeployment?: Deployment;
  onDelete?: () => void;
}

function AppCard({ app, activeDeployment, onDelete }: AppCardProps) {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showAppRenameError, setShowAppRenameError] = React.useState<boolean>(false);
  const [editingTitle, setEditingTitle] = React.useState<boolean>(false);
  const [appTitle, setAppTitle] = React.useState<string | undefined>(app?.name);
  const appTitleInput = React.useRef<HTMLInputElement | null>(null);

  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = React.useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  const handleRenameClick = React.useCallback(() => {
    setMenuAnchorEl(null);
    setEditingTitle(true);
  }, []);

  const handleDeleteClick = React.useCallback(() => {
    setMenuAnchorEl(null);
    if (onDelete) {
      onDelete();
    }
  }, [onDelete]);

  const handleAppRename = React.useCallback(
    async (name: string) => {
      if (app?.id) {
        try {
          await client.mutation.updateApp(app.id, name);
          await client.invalidateQueries('getApps');
        } catch (err) {
          setShowAppRenameError(true);
          setEditingTitle(true);
        }
      }
    },
    [app?.id],
  );

  const handleAppTitleBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      setEditingTitle(false);
      handleAppRename(event.target.value);
    },
    [handleAppRename],
  );

  const handleAppTitleInput = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      setAppTitle((event.target as HTMLInputElement).value);
      setShowAppRenameError(false);
      if (event.key === 'Escape') {
        if (appTitleInput.current?.value && app?.name) {
          setAppTitle(app.name);
          appTitleInput.current.value = app.name;
        }
        setEditingTitle(false);
        return;
      }
      if (event.key === 'Enter') {
        setEditingTitle(false);
        handleAppRename((event.target as HTMLInputElement).value);
      }
    },
    [app?.name, handleAppRename],
  );

  const openDisabled = !app || !activeDeployment;
  let openButton = (
    <Button
      disabled={!app || !activeDeployment}
      size="small"
      component="a"
      href={app ? `deploy/${app.id}` : ''}
    >
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
          action={
            <IconButton
              aria-label="settings"
              aria-controls={menuOpen ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? 'true' : undefined}
              onClick={handleMenuClick}
            >
              <MoreVertIcon />
            </IconButton>
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
          <EditableText
            onBlur={handleAppTitleBlur}
            onKeyUp={handleAppTitleInput}
            editing={editingTitle}
            isError={showAppRenameError}
            errorText={`An app named "${appTitle}" already exists`}
            loading={Boolean(!app)}
            defaultValue={appTitle}
            variant="subtitle1"
            ref={appTitleInput}
          />
        </CardContent>
        <CardActions>
          <Button
            size="small"
            component="a"
            href={app ? `/_toolpad/app/${app.id}/editor` : ''}
            disabled={!app}
          >
            Edit
          </Button>
          {openButton}
        </CardActions>
      </Card>
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
    </React.Fragment>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index ? <Box>{children}</Box> : null}
    </div>
  );
}

interface TabListProps {
  value: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

function TabList({ value, handleTabChange }: TabListProps) {
  return (
    <Tabs
      value={value}
      onChange={handleTabChange}
      sx={{ minHeight: 'inherit', '& > div.MuiTabs-scroller': { display: 'inline-flex' } }}
      aria-label="tabs list"
    >
      <Tab label="Apps" />
      <Tab label="Data" />
    </Tabs>
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

  const [deletedApp, setDeletedApp] = React.useState<null | App>(null);

  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabChange = React.useCallback((event: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
  }, []);

  const [viewMode, setViewMode] = React.useState<string>('list');

  const handleViewModeChange = React.useCallback((event: React.MouseEvent, value: string) => {
    setViewMode(value);
  }, []);

  return (
    <ToolpadShell navigation={<TabList value={tabIndex} handleTabChange={handleTabChange} />}>
      <AppDeleteDialog app={deletedApp} onClose={() => setDeletedApp(null)} />
      <TabPanel index={0} value={tabIndex}>
        <Container>
          <CreateAppDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />

          <Toolbar variant={'regular'} disableGutters sx={{ justifyContent: 'space-between' }}>
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
          {viewMode === 'grid' ? (
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
                    return '';
                }
              })()}
            </Box>
          ) : null}
          {viewMode === 'list' ? (
            <Table sx={{ minWidth: 650 }} aria-label="apps list" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apps.map((app) => (
                  <TableRow
                    key={app.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <EditableText
                        defaultValue={app.name}
                        helperText={`Edited at ${getReadableDuration(app.editedAt)}`}
                      />
                    </TableCell>
                    <TableCell align="right">{}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </Container>
      </TabPanel>
    </ToolpadShell>
  );
}
