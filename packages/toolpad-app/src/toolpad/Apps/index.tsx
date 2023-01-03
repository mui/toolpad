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
  Divider,
  Link as MuiLink,
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
  Alert,
  AlertTitle,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import Search from '@mui/icons-material/SearchOutlined';
import invariant from 'invariant';
import { Link, useNavigate } from 'react-router-dom';
import Script from 'next/script';
import client from '../../api';
import DialogForm from '../../components/DialogForm';
import type { Deployment } from '../../../prisma/generated/client';
import ToolpadHomeShell from '../ToolpadHomeShell';
import getReadableDuration from '../../utils/readableDuration';
import type { AppMeta } from '../../server/data';
import useLocalStorageState from '../../utils/useLocalStorageState';
import ErrorAlert from '../AppEditor/PageEditor/ErrorAlert';
import config from '../../config';
import { AppTemplateId } from '../../types';
import { errorFrom } from '../../utils/errors';
import AppOptions from '../AppOptions';
import AppNameEditable from '../AppOptions/AppNameEditable';
import { ERR_VALIDATE_CAPTCHA_FAILED } from '../../errorCodes';

import { sendAppCreatedEvent } from '../../utils/ga';
import { StoredLatestCreatedApp, TOOLPAD_LATEST_CREATED_APP_KEY } from '../../storageKeys';
import FlexFill from '../../components/FlexFill';
import ToolpadShell from '../ToolpadShell';

export const APP_TEMPLATE_OPTIONS: Map<
  AppTemplateId,
  {
    label: string;
    description: string;
  }
> = new Map([
  [
    'default',
    {
      label: 'Default',
      description: 'HR management tool',
    },
  ],
  [
    'blank',
    {
      label: 'Blank page',
      description: 'Start with an empty canvas',
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

export interface SurveyDialogProps {
  open: boolean;
  onClose?: () => void;
  loading: boolean;
}

function SurveyDialog({ onClose, open, loading, ...props }: SurveyDialogProps) {
  return (
    <Dialog
      {...props}
      open={open}
      onClose={onClose}
      sx={{ maxWidth: '700px', margin: '0 auto' }}
      maxWidth={false}
    >
      <DialogForm onSubmit={() => {}}>
        <DialogTitle>You feedback is really valuable!</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 5 }}>
            We are really happy to see you exploring Toolpad! You can help us improve it by taking 2
            minutes to fill out the questionnaire below. Feel free to skip it by the clicking the
            button at the bottom.
          </Typography>

          <iframe
            title="Survey"
            src="https://docs.google.com/forms/d/e/1FAIpQLSfM2NSUkBcMoAZgQnpl5l1Whv1RSw_OXFrxEeSmNpi9Tnh7YQ/viewform?embedded=true"
            width="600"
            height="500"
            frameBorder="0"
          >
            Loading…
          </iframe>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            fullWidth
            variant="contained"
            type="submit"
            onClick={onClose}
            loading={loading}
          >
            Continue to the app
          </LoadingButton>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
}

const NO_OP = () => {};

export interface CreateAppDialogProps {
  open: boolean;
  onClose?: () => void;
  onContinueToExistingApp?: (appId: string) => void;
}

function CreateAppDialog({
  onClose,
  open,
  onContinueToExistingApp = NO_OP,
  ...props
}: CreateAppDialogProps) {
  const [name, setName] = React.useState('');
  const [appTemplateId, setAppTemplateId] = React.useState<AppTemplateId>('default');
  const [dom, setDom] = React.useState('');
  const [recaptchaApiLoaded, setRecaptchaApiLoaded] = React.useState(false);
  const [requestRecaptchaV2, setRequestRecaptchaV2] = React.useState(false);
  const [recaptchaV2Token, setRecaptchaV2Token] = React.useState('');

  const captchaTargetRef = React.useRef<HTMLDivElement | null>(null);

  const [isNavigatingToNewApp, setIsNavigatingToNewApp] = React.useState(false);

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
      setIsNavigatingToNewApp(true);
    },
  });

  const navigate = useNavigate();
  const [surveySeen, setSurveySeen] = useLocalStorageState<boolean>('toolpad-survey-seen', false);

  const [latestCreatedApp, setLatestCreatedApp] = useLocalStorageState<StoredLatestCreatedApp>(
    TOOLPAD_LATEST_CREATED_APP_KEY,
    null,
  );
  const firstLatestCreatedAppRef = React.useRef(latestCreatedApp);
  const firstLatestCreatedApp = firstLatestCreatedAppRef.current;
  React.useEffect(() => {
    if (!firstLatestCreatedApp) {
      firstLatestCreatedAppRef.current = latestCreatedApp;
    }
  }, [firstLatestCreatedApp, latestCreatedApp]);

  const isFormValid = config.isDemo ? true : !!name;

  const isSubmitting = createAppMutation.isLoading || isNavigatingToNewApp;

  const handleContinueButtonClick = React.useCallback(() => {
    if (!firstLatestCreatedApp) {
      return;
    }

    if (!surveySeen) {
      onContinueToExistingApp(firstLatestCreatedApp.appId);
      setSurveySeen(true);

      return;
    }

    navigate(`/app/${firstLatestCreatedApp.appId}`);
  }, [firstLatestCreatedApp, onContinueToExistingApp, surveySeen, setSurveySeen, navigate]);

  const recaptchaSubmitEnabled =
    config.recaptchaV2SiteKey || config.recaptchaV3SiteKey
      ? recaptchaApiLoaded && ((requestRecaptchaV2 && recaptchaV2Token) || !requestRecaptchaV2)
      : true;

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      invariant(isFormValid, 'Invalid form should not be submitted when submit is disabled');

      event.preventDefault();

      // Fallback: request validation with RecaptchaV2 instead, so requestRecaptchaV2 will be true

      // Check if this is the fallback scenario
      let recaptchaToken = requestRecaptchaV2 ? recaptchaV2Token : '';

      if (config.recaptchaV3SiteKey && !requestRecaptchaV2) {
        // Invisible captcha validation
        recaptchaToken = await grecaptcha.execute(config.recaptchaV3SiteKey, {
          action: 'submit',
        });
      }

      const appName = config.isDemo ? `demo_app_${Date.now()}` : name;
      const appDom = dom.trim() ? JSON.parse(dom) : null;

      try {
        const createdApp = await createAppMutation.mutateAsync([
          appName,
          {
            from: {
              ...(appDom ? { kind: 'dom', dom: appDom } : { kind: 'template', id: appTemplateId }),
            },
            ...(recaptchaToken
              ? {
                  captcha: {
                    token: recaptchaToken,
                    version: requestRecaptchaV2 ? 2 : 3,
                  },
                }
              : {}),
          },
        ]);

        setLatestCreatedApp({
          appId: createdApp.id,
          appName: createdApp.name,
        });

        sendAppCreatedEvent(createdApp.name, appTemplateId);
      } catch (rawError) {
        const error = errorFrom(rawError);
        if (config.recaptchaV2SiteKey && error.code === ERR_VALIDATE_CAPTCHA_FAILED) {
          // Show recaptcha v2 checkbox as a fallback
          setRequestRecaptchaV2(true);
        } else {
          throw error;
        }
      }
    },
    [
      appTemplateId,
      createAppMutation,
      dom,
      isFormValid,
      name,
      recaptchaV2Token,
      requestRecaptchaV2,
      setLatestCreatedApp,
    ],
  );

  return (
    <Dialog {...props} open={open} onClose={config.isDemo ? NO_OP : onClose} maxWidth="xs">
      {config.recaptchaV3SiteKey ? (
        <Script
          strategy="afterInteractive"
          src={`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(
            config.recaptchaV3SiteKey,
          )}`}
          onReady={() => {
            grecaptcha.ready(() => {
              if (config.recaptchaV2SiteKey) {
                invariant(captchaTargetRef.current, 'Recaptcha v2 widget ref not attached');
                grecaptcha.render(captchaTargetRef.current, {
                  sitekey: config.recaptchaV2SiteKey,
                  callback: (token) => {
                    setRecaptchaV2Token(token);
                  },
                  'expired-callback': () => {
                    setRecaptchaV2Token('');
                  },
                });
              }
              setRecaptchaApiLoaded(true);
            });
          }}
        />
      ) : null}
      <DialogForm onSubmit={handleSubmit}>
        <DialogTitle>Create a new App</DialogTitle>
        <DialogContent>
          {config.isDemo ? (
            <Alert severity="warning" sx={{ mb: 1 }}>
              <AlertTitle>For demo purposes only!</AlertTitle>
              Your application will be ephemeral and may be deleted at any time.
            </Alert>
          ) : (
            <TextField
              sx={{ my: 1 }}
              required
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
              disabled={isSubmitting}
            />
          )}

          <TextField
            sx={{ my: 1 }}
            label="Use template"
            select
            fullWidth
            value={appTemplateId}
            onChange={handleAppTemplateChange}
            disabled={isSubmitting}
          >
            {Array.from(APP_TEMPLATE_OPTIONS).map(([value, { label, description }]) => (
              <MenuItem key={value} value={value}>
                <span>
                  <Typography>{label}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'normal' }}>
                    {description || ''}
                  </Typography>
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
              disabled={isSubmitting}
            />
          ) : null}
          {config.isDemo && firstLatestCreatedApp ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" textAlign="center">
                or
              </Typography>
              <LoadingButton
                variant="outlined"
                size="medium"
                sx={{ mt: 0.5, mb: 1 }}
                onClick={handleContinueButtonClick}
                disabled={isSubmitting}
              >
                Continue working on your latest app
              </LoadingButton>
            </Box>
          ) : null}
          {config.recaptchaV2SiteKey ? (
            <Box
              sx={{
                display: requestRecaptchaV2 ? 'flex' : 'none',
                justifyContent: 'center',
                my: 1,
              }}
            >
              <div ref={captchaTargetRef} />
            </Box>
          ) : null}
          {config.recaptchaV3SiteKey ? (
            <Box mt={2}>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'normal' }}>
                This site is protected by reCAPTCHA and the Google{' '}
                <MuiLink
                  href="https://policies.google.com/privacy"
                  underline="none"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </MuiLink>{' '}
                and{' '}
                <MuiLink
                  href="https://policies.google.com/terms"
                  underline="none"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </MuiLink>{' '}
                apply.
              </Typography>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            variant="text"
            onClick={() => {
              setName('');
              createAppMutation.reset();
              onClose?.();
            }}
            disabled={!onClose}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            loading={createAppMutation.isLoading || isNavigatingToNewApp}
            disabled={!isFormValid || isSubmitting || !recaptchaSubmitEnabled}
          >
            Create
          </LoadingButton>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
}

interface AppEditButtonProps {
  app?: AppMeta;
}

function AppEditButton({ app }: AppEditButtonProps) {
  return (
    <Button size="small" component={Link} to={app ? `/app/${app.id}` : ''} disabled={!app}>
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
    <Button
      disabled={!app || !activeDeployment}
      component="a"
      href={app ? `/deploy/${app.id}` : ''}
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
  return openButton;
}

interface AppCardProps {
  app?: AppMeta;
  activeDeployment?: Deployment;
  existingAppNames?: string[];
}

function AppCard({ app, activeDeployment, existingAppNames }: AppCardProps) {
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
        action={app ? <AppOptions app={app} onRename={handleRename} /> : null}
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
        {app ? (
          <AppNameEditable
            app={app}
            editing={editingName}
            setEditing={setEditingName}
            existingAppNames={existingAppNames}
          />
        ) : (
          <Skeleton />
        )}
      </CardContent>
      <CardActions>
        <AppEditButton app={app} />
        <AppOpenButton app={app} activeDeployment={activeDeployment} />
      </CardActions>
    </Card>
  );
}

interface AppRowProps {
  app?: AppMeta;
  activeDeployment?: Deployment;
  existingAppNames?: string[];
}

function AppRow({ app, activeDeployment, existingAppNames }: AppRowProps) {
  const [editingName, setEditingName] = React.useState<boolean>(false);

  const handleRename = React.useCallback(() => {
    setEditingName(true);
  }, []);

  return (
    <TableRow hover role="row">
      <TableCell component="th" scope="row">
        {app ? (
          <AppNameEditable
            app={app}
            editing={editingName}
            setEditing={setEditingName}
            existingAppNames={existingAppNames}
          />
        ) : (
          <Skeleton />
        )}
        <Typography variant="caption">
          {app ? `Edited ${getReadableDuration(app.editedAt)}` : <Skeleton />}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={1} justifyContent={'flex-end'}>
          {app ? (
            <React.Fragment>
              <AppEditButton app={app} />
              <AppOpenButton app={app} activeDeployment={activeDeployment} />
              <AppOptions app={app} onRename={handleRename} />
            </React.Fragment>
          ) : null}
        </Stack>
      </TableCell>
    </TableRow>
  );
}

interface AppsViewProps {
  apps: AppMeta[];
  loading?: boolean;
  activeDeploymentsByApp: { [appId: string]: Deployment } | null;
  existingAppNames?: string[];
}

function AppsGridView({ loading, apps, activeDeploymentsByApp, existingAppNames }: AppsViewProps) {
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
              existingAppNames={existingAppNames}
            />
          );
        });
      })()}
    </Box>
  );
}

function AppsListView({ loading, apps, activeDeploymentsByApp, existingAppNames }: AppsViewProps) {
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
                existingAppNames={existingAppNames}
              />
            );
          });
        })()}
      </TableBody>
    </Table>
  );
}

function DemoPage() {
  const navigate = useNavigate();
  const [appToContinue, setAppToContinue] = React.useState<null | string>(null);
  const [navigating, setNavigating] = React.useState(false);
  const handleSurveyClose = () => {
    invariant(appToContinue, 'App to continue must be defined');

    setNavigating(true);

    navigate(`/app/${appToContinue}`);
  };

  return (
    <ToolpadShell>
      <CreateAppDialog open onContinueToExistingApp={(appId) => setAppToContinue(appId)} />
      {config.isDemo ? (
        <SurveyDialog
          open={Boolean(appToContinue)}
          loading={navigating}
          onClose={handleSurveyClose}
        />
      ) : null}
    </ToolpadShell>
  );
}

export default function Home() {
  const {
    data: apps = [],
    isLoading,
    error,
  } = client.useQuery('getApps', [], {
    enabled: !config.isDemo,
  });
  const { data: activeDeployments } = client.useQuery('getActiveDeployments', []);

  const existingAppNames = React.useMemo(() => {
    return apps.map((app) => app.name);
  }, [apps]);

  const activeDeploymentsByApp = React.useMemo(() => {
    if (!activeDeployments) {
      return null;
    }
    return Object.fromEntries(
      activeDeployments.map((deployment) => [deployment.appId, deployment]),
    );
  }, [activeDeployments]);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(config.isDemo);

  const [viewMode, setViewMode] = useLocalStorageState<string>('home-app-view-mode', 'list');

  const handleViewModeChange = React.useCallback(
    (event: React.MouseEvent, value: string) => setViewMode(value),
    [setViewMode],
  );

  const AppsView = viewMode === 'list' ? AppsListView : AppsGridView;

  const [searchText, setSearchText] = React.useState('');

  const handleSearchInput = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  }, []);

  const filteredApps = React.useMemo(() => {
    return apps.filter((element: any) =>
      element.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [apps, searchText]);

  return config.isDemo ? (
    <DemoPage />
  ) : (
    <ToolpadHomeShell>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Toolbar variant="regular" disableGutters sx={{ gap: 2, px: 5, mt: 3, mb: 2 }}>
          <Typography sx={{ pl: 2 }} variant="h3">
            Apps
          </Typography>
          <FlexFill />
          <TextField
            sx={(theme) => ({
              '& .MuiInputBase-root': {
                fontSize: theme.typography.pxToRem(14),
              },
              '& .MuiInputBase-input': {
                paddingTop: theme.spacing(0.7),
                paddingBottom: theme.spacing(0.7),
              },
              '& .MuiSvgIcon-root': {
                fontSize: theme.typography.pxToRem(16),
                color:
                  theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[500],
                marginRight: theme.spacing(0.6),
              },
            })}
            key={'search'}
            InputProps={{
              startAdornment: <Search />,
            }}
            placeholder={'Search apps'}
            value={searchText}
            onChange={handleSearchInput}
          />
          <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>
            Create New
          </Button>
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
              <ViewListIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton
              value="grid"
              aria-label="grid view"
              color={viewMode === 'grid' ? 'primary' : undefined}
            >
              <GridViewIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
        {error ? (
          <ErrorAlert error={error} />
        ) : (
          <Box sx={{ flex: 1, overflow: 'auto', px: 5, scrollbarGutter: 'stable' }}>
            <AppsView
              apps={filteredApps}
              loading={isLoading}
              activeDeploymentsByApp={activeDeploymentsByApp}
              existingAppNames={existingAppNames}
            />
          </Box>
        )}
      </Box>
      <CreateAppDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
    </ToolpadHomeShell>
  );
}
