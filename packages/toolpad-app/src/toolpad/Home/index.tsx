import * as React from 'react';
import {
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
  Link,
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
  Divider,
  Checkbox,
  FormControlLabel,
  Alert,
  AlertTitle,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import { Controller, useForm } from 'react-hook-form';
import useBoolean from '../../utils/useBoolean';
import useEvent from '../../utils/useEvent';
import client from '../../api';
import DialogForm from '../../components/DialogForm';
import type { Deployment } from '../../../prisma/generated/client';
import useLatest from '../../utils/useLatest';
import ToolpadShell from '../ToolpadShell';
import UpdateBanner from './UpdateBanner';
import getReadableDuration from '../../utils/readableDuration';
import EditableText from '../../components/EditableText';
import type { AppMeta } from '../../server/data';
import useMenu from '../../utils/useMenu';
import useLocalStorageState from '../../utils/useLocalStorageState';
import ErrorAlert from '../AppEditor/PageEditor/ErrorAlert';
import { ConfirmDialog } from '../../components/SystemDialogs';
import config from '../../config';
import { AppTemplateId } from '../../types';
import { errorFrom } from '../../utils/errors';

export const APP_TEMPLATE_OPTIONS = {
  blank: {
    label: 'Blank page',
    description: 'Start with an empty canvas',
  },
  stats: {
    label: 'Statistics',
    description: 'Table with statistics data',
  },
  images: {
    label: 'Images',
    description: 'Fetch remote images',
  },
};

const NO_OP = () => {};

export interface CreateAppDialogProps {
  open: boolean;
  onClose: () => void;
}

function CreateAppDialog({ onClose, ...props }: CreateAppDialogProps) {
  const [name, setName] = React.useState('');
  const [appTemplateId, setAppTemplateId] = React.useState<AppTemplateId>('blank');
  const [dom, setDom] = React.useState('');

  const handleAppTemplateChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAppTemplateId(event.target.value as AppTemplateId);
    },
    [],
  );

  const handleDomChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => setDom(event.target.value),
    [],
  );

  const createAppMutation = client.useMutation('createApp', {
    onSuccess: (app) => {
      window.location.href = `/_toolpad/app/${app.id}`;
    },
  });

  const isDemo = !!process.env.TOOLPAD_DEMO;

  return (
    <React.Fragment>
      <Dialog {...props} onClose={isDemo ? NO_OP : onClose} maxWidth="xs">
        <DialogForm
          onSubmit={async (event) => {
            event.preventDefault();
            let recaptchaToken;
            if (config.recaptchaSiteKey) {
              await new Promise<void>((resolve) => grecaptcha.ready(resolve));
              recaptchaToken = await grecaptcha.execute(config.recaptchaSiteKey, {
                action: 'submit',
              });
            }

            const appDom = dom.trim() ? JSON.parse(dom) : null;
            await createAppMutation.mutateAsync([
              name,
              {
                from: {
                  ...(appDom
                    ? { kind: 'dom', dom: appDom }
                    : { kind: 'template', id: appTemplateId }),
                },
                recaptchaToken,
              },
            ]);
          }}
        >
          <DialogTitle>Create a new MUI Toolpad App</DialogTitle>
          <DialogContent>
            {isDemo ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <AlertTitle>For demo purposes only!</AlertTitle>
                Your application will be ephemeral and may be deleted at any time.
              </Alert>
            ) : null}
            <TextField
              sx={{ my: 1 }}
              autoFocus
              fullWidth
              label="Name"
              value={name}
              error={createAppMutation.isError}
              helperText={(createAppMutation.error as Error)?.message || ''}
              onChange={(event) => {
                createAppMutation.reset();
                setName(event.target.value);
              }}
            />

            <TextField
              sx={{ my: 1 }}
              label="Use template"
              select
              fullWidth
              value={appTemplateId}
              onChange={handleAppTemplateChange}
            >
              {Object.entries(APP_TEMPLATE_OPTIONS).map(([value, { label, description }]) => (
                <MenuItem key={value} value={value}>
                  <span>
                    <Typography>{label}</Typography>
                    <Typography variant="caption">{description || ''}</Typography>
                  </span>
                </MenuItem>
              ))}
            </TextField>

            {config.enableCreateByDom ? (
              <TextField
                sx={{ my: 1 }}
                label="Seed DOM"
                fullWidth
                multiline
                maxRows={10}
                value={dom}
                onChange={handleDomChange}
              />
            ) : null}
            {config.recaptchaSiteKey ? (
              <Typography variant="caption" color="text.secondary">
                This site is protected by reCAPTCHA and the Google{' '}
                <Link
                  href="https://policies.google.com/privacy"
                  underline="none"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link
                  href="https://policies.google.com/terms"
                  underline="none"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </Link>{' '}
                apply.
              </Typography>
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
              disabled={isDemo}
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
      okButton="delete"
      loading={deleteAppMutation.isLoading}
    >
      Are you sure you want to delete application &quot;{latestApp?.name}&quot;
    </ConfirmDialog>
  );
}

interface AppNameEditableProps {
  app?: AppMeta;
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
  app?: AppMeta;
}

function AppEditButton({ app }: AppEditButtonProps) {
  return (
    <Button size="small" component="a" href={app ? `/_toolpad/app/${app.id}` : ''} disabled={!app}>
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

interface AppSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  app: AppMeta;
}

function AppSettingsDialog({ app, open, onClose }: AppSettingsDialogProps) {
  const updateAppMutation = client.useMutation('updateApp');

  const { handleSubmit, reset, control } = useForm({
    defaultValues: {
      public: app.public,
    },
  });

  const handleClose = useEvent(() => {
    onClose();
    reset();
    updateAppMutation.reset();
  });

  const doSubmit = handleSubmit(async (updates) => {
    await updateAppMutation.mutateAsync([app.id, updates]);
    onClose();
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogForm onSubmit={doSubmit}>
        <DialogTitle>Application settings for &quot;{app.name}&quot;</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Controller
                control={control}
                name="public"
                render={({ field: { value, onChange, ...field } }) => (
                  <Checkbox
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                )}
              />
            }
            label="Make application public"
          />
          {updateAppMutation.error ? <ErrorAlert error={updateAppMutation.error} /> : null}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" loading={updateAppMutation.isLoading}>
            Save
          </LoadingButton>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
}

interface AppOptionsProps {
  app?: AppMeta;
  onRename: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

function AppOptions({ app, onRename, onDelete, onDuplicate }: AppOptionsProps) {
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

  const {
    setTrue: handleOpenSettings,
    setFalse: handleCloseSettings,
    value: settingsOpen,
  } = useBoolean(false);

  const handleopenSettingsClick = React.useCallback(() => {
    onMenuClose();
    handleOpenSettings();
  }, [handleOpenSettings, onMenuClose]);

  return (
    <React.Fragment>
      <IconButton {...buttonProps} aria-label="Application menu" disabled={!app}>
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
        <Divider />
        <MenuItem onClick={handleopenSettingsClick}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
      </Menu>
      {app ? (
        <AppSettingsDialog open={settingsOpen} onClose={handleCloseSettings} app={app} />
      ) : null}
    </React.Fragment>
  );
}

interface AppCardProps {
  app?: AppMeta;
  activeDeployment?: Deployment;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

function AppCard({ app, activeDeployment, onDelete, onDuplicate }: AppCardProps) {
  const [editingName, setEditingName] = React.useState<boolean>(false);

  const handleRename = React.useCallback(() => {
    setEditingName(true);
  }, []);

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
          <AppOpenButton app={app} activeDeployment={activeDeployment} />
        </CardActions>
      </Card>
    </React.Fragment>
  );
}

interface AppRowProps {
  app?: AppMeta;
  activeDeployment?: Deployment;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

function AppRow({ app, activeDeployment, onDelete, onDuplicate }: AppRowProps) {
  const [editingName, setEditingName] = React.useState<boolean>(false);

  const handleRename = React.useCallback(() => {
    setEditingName(true);
  }, []);

  return (
    <React.Fragment>
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
            <AppOpenButton app={app} activeDeployment={activeDeployment} />
            <AppOptions
              app={app}
              onRename={handleRename}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          </Stack>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

interface AppsViewProps {
  apps: AppMeta[];
  loading?: boolean;
  activeDeploymentsByApp: { [appId: string]: Deployment } | null;
  setDeletedApp: (app: AppMeta) => void;
  duplicateApp: (app: AppMeta) => void;
}

function AppsGridView({
  loading,
  apps,
  activeDeploymentsByApp,
  setDeletedApp,
  duplicateApp,
}: AppsViewProps) {
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
        if (apps.length <= 0) {
          return 'No apps yet';
        }
        return apps.map((app) => {
          const activeDeployment = activeDeploymentsByApp?.[app.id];
          return (
            <AppCard
              key={app.id}
              app={app}
              activeDeployment={activeDeployment}
              onDelete={() => setDeletedApp(app)}
              onDuplicate={() => duplicateApp(app)}
            />
          );
        });
      })()}
    </Box>
  );
}

function AppsListView({
  loading,
  apps,
  activeDeploymentsByApp,
  setDeletedApp,
  duplicateApp,
}: AppsViewProps) {
  return (
    <Table aria-label="apps list" size="medium">
      <TableBody>
        {(() => {
          if (loading) {
            return <AppRow />;
          }
          if (apps.length <= 0) {
            return (
              <TableRow>
                <TableCell>No apps yet</TableCell>
              </TableRow>
            );
          }
          return apps.map((app) => {
            const activeDeployment = activeDeploymentsByApp?.[app.id];
            return (
              <AppRow
                key={app.id}
                app={app}
                activeDeployment={activeDeployment}
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

export default function Home() {
  const isDemo = !!process.env.TOOLPAD_DEMO;

  const {
    data: apps = [],
    isLoading,
    error,
  } = client.useQuery('getApps', [], {
    enabled: !isDemo,
  });
  const { data: activeDeployments } = client.useQuery('getActiveDeployments', []);

  const activeDeploymentsByApp = React.useMemo(() => {
    if (!activeDeployments) {
      return null;
    }
    return Object.fromEntries(
      activeDeployments.map((deployment) => [deployment.appId, deployment]),
    );
  }, [activeDeployments]);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(isDemo);

  const [deletedApp, setDeletedApp] = React.useState<null | AppMeta>(null);

  const [viewMode, setViewMode] = useLocalStorageState<string>('home-app-view-mode', 'list');

  const handleViewModeChange = React.useCallback(
    (event: React.MouseEvent, value: string) => setViewMode(value),
    [setViewMode],
  );

  const AppsView = viewMode === 'list' ? AppsListView : AppsGridView;

  const duplicateAppMutation = client.useMutation('duplicateApp');

  const duplicateApp = React.useCallback(
    async (app: AppMeta) => {
      if (app) {
        await duplicateAppMutation.mutateAsync([app.id, app.name]);
      }
      await client.invalidateQueries('getApps');
    },
    [duplicateAppMutation],
  );

  return (
    <ToolpadShell>
      <AppDeleteDialog app={deletedApp} onClose={() => setDeletedApp(null)} />
      {!isDemo ? (
        <Container>
          <Typography variant="h2">Apps</Typography>
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
          {error ? (
            <ErrorAlert error={error} />
          ) : (
            <AppsView
              apps={apps}
              loading={isLoading}
              activeDeploymentsByApp={activeDeploymentsByApp}
              setDeletedApp={setDeletedApp}
              duplicateApp={duplicateApp}
            />
          )}
          <UpdateBanner />
        </Container>
      ) : null}
      <CreateAppDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
    </ToolpadShell>
  );
}
