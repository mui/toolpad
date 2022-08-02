import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box, CircularProgress, NoSsr, styled } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';
import Release from './Release';
import Releases from './Releases';
import AppEditor from './AppEditor';
import Home from './Home';
import ErrorAlert from './AppEditor/PageEditor/ErrorAlert';
import UserFeedback from './UserFeedback';

const Centered = styled('div')({
  height: '100%',
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
    <Centered>
      <ErrorAlert error={error} />
    </Centered>
  );
}

function AppWorkspace() {
  return (
    <Routes>
      <Route>
        <Route path="editor/*" element={<AppEditor />} />
        <Route path="releases" element={<Releases />} />
        <Route path="releases/:version" element={<Release />} />
      </Route>
    </Routes>
  );
}

export interface EditorProps {
  basename: string;
}

export default function Toolpad({ basename }: EditorProps) {
  return (
    <NoSsr>
      {/* Container that allows children to size to it with height: 100% */}
      <Box sx={{ height: '1px', minHeight: '100vh' }}>
        <ErrorBoundary fallbackRender={({ error }) => <FullPageError error={error} />}>
          <React.Suspense fallback={<FullPageLoader />}>
            <UserFeedback>
              <BrowserRouter basename={basename}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/app/:appId/*" element={<AppWorkspace />} />
                </Routes>
              </BrowserRouter>
            </UserFeedback>
          </React.Suspense>
        </ErrorBoundary>
      </Box>
    </NoSsr>
  );
}
