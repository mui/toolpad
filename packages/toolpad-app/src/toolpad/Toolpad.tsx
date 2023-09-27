import { CircularProgress, Box, styled, CssBaseline, Button, Stack, Tooltip } from '@mui/material';
import * as React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SyncIcon from '@mui/icons-material/Sync';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import NoSsr from '../components/NoSsr';
import AppEditor from './AppEditor';
import ErrorAlert from './AppEditor/PageEditor/ErrorAlert';
import { ThemeProvider } from '../ThemeContext';
import { APP_FUNCTIONS_ROUTE } from '../routes';
import ToolpadShell from './ToolpadShell';
import { getViewFromPathname } from '../utils/domView';
import AppProvider, { AppState, useAppStateContext } from './AppState';
import { GLOBAL_FUNCTIONS_FEATURE_FLAG } from '../constants';

const Centered = styled('div')({
  height: '100%',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

function FullPageLoader() {
  return (
    <Centered>
      <CircularProgress />
    </Centered>
  );
}

interface FullPageErrorProps {
  error: Error;
}

function FullPageError({ error }: FullPageErrorProps) {
  return (
    <Centered sx={{ p: 4 }}>
      <ErrorAlert sx={{ width: '100%' }} error={error} />
    </Centered>
  );
}

function ErrorFallback({ error }: FallbackProps) {
  return <FullPageError error={error} />;
}

function getAppSaveState(appState: AppState): React.ReactNode {
  if (appState.saveDomError) {
    return (
      <Tooltip title="Error while saving">
        <SyncProblemIcon color="primary" />
      </Tooltip>
    );
  }

  const isSaving = appState.unsavedDomChanges > 0;

  if (isSaving) {
    return (
      <Tooltip title="Saving changes…">
        <SyncIcon color="primary" />
      </Tooltip>
    );
  }

  return (
    <Tooltip title="All changes saved!">
      <CloudDoneIcon color="primary" />
    </Tooltip>
  );
}

export interface RouteShellProps {
  children: React.ReactNode;
}

function RouteShell({ children }: RouteShellProps) {
  const appState = useAppStateContext();

  const location = useLocation();

  const shellProps = React.useMemo(() => {
    const currentView = getViewFromPathname(location.pathname);

    if (currentView) {
      const currentPageId = currentView.kind === 'page' ? currentView.nodeId : null;

      const previewPath = currentPageId ? `/preview/pages/${currentPageId}` : '/preview';

      return {
        actions: (
          <Stack direction="row" gap={1} alignItems="center">
            <Button
              variant="outlined"
              endIcon={<OpenInNewIcon />}
              color="primary"
              component="a"
              href={previewPath}
              target="_blank"
            >
              Preview
            </Button>
          </Stack>
        ),
        status: getAppSaveState(appState),
      };
    }

    return {};
  }, [appState, location.pathname]);

  return <ToolpadShell {...shellProps}>{children}</ToolpadShell>;
}

export interface ToolpadProps {
  basename: string;
}

export default function Toolpad({ basename }: ToolpadProps) {
  return (
    <NoSsr>
      <ThemeProvider>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {/* Container that allows children to size to it with height: 100% */}
        <Box sx={{ height: '1px', minHeight: '100vh' }}>
          <ErrorBoundary fallbackRender={ErrorFallback}>
            <React.Suspense fallback={<FullPageLoader />}>
              <BrowserRouter basename={basename}>
                <AppProvider>
                  <RouteShell>
                    <Routes>
                      {GLOBAL_FUNCTIONS_FEATURE_FLAG ? (
                        <Route path={APP_FUNCTIONS_ROUTE} element={<div />} />
                      ) : null}
                      <Route path="/*" element={<AppEditor />} />
                    </Routes>
                  </RouteShell>
                </AppProvider>
              </BrowserRouter>
            </React.Suspense>
          </ErrorBoundary>
        </Box>
      </ThemeProvider>
    </NoSsr>
  );
}
