import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Box, CircularProgress, styled } from '@mui/material';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import AppEditor from './AppEditor';
import Apps from './Apps';
import ErrorAlert from './AppEditor/PageEditor/ErrorAlert';
import NoSsr from '../components/NoSsr';
import Connections from './Connections';

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

function LegacyEditorUrlRedirect() {
  const { '*': editorRoute } = useParams();
  return <Navigate to={`../${editorRoute}`} />;
}

function AppWorkspace() {
  return (
    <Routes>
      <Route>
        <Route path="editor/*" element={<LegacyEditorUrlRedirect />} />
        <Route path="*" element={<AppEditor />} />
      </Route>
    </Routes>
  );
}

function ErrorFallback({ error }: FallbackProps) {
  return <FullPageError error={error} />;
}

export interface EditorProps {
  basename: string;
}

export default function Toolpad({ basename }: EditorProps) {
  return (
    <NoSsr>
      {/* Container that allows children to size to it with height: 100% */}
      <Box sx={{ height: '1px', minHeight: '100vh' }}>
        <ErrorBoundary fallbackRender={ErrorFallback}>
          <React.Suspense fallback={<FullPageLoader />}>
            <BrowserRouter basename={basename}>
              <Routes>
                <Route path="/" element={<Navigate to="apps" replace />} />
                <Route path="/apps" element={<Apps />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/app/:appId/*" element={<AppWorkspace />} />
              </Routes>
            </BrowserRouter>
          </React.Suspense>
        </ErrorBoundary>
      </Box>
    </NoSsr>
  );
}
