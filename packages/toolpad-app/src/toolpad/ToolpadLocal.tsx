import { CircularProgress, Box, styled } from '@mui/material';
import * as React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NoSsr from '../components/NoSsr';
import { APP_ID_LOCAL_MARKER } from '../constants';
import { EditorContent } from './AppEditor';
import ErrorAlert from './AppEditor/PageEditor/ErrorAlert';

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

function ErrorFallback({ error }: FallbackProps) {
  return <FullPageError error={error} />;
}

export interface ToolpadLocalProps {
  basename: string;
}

export default function ToolpadLocal({ basename }: ToolpadLocalProps) {
  return (
    <NoSsr>
      {/* Container that allows children to size to it with height: 100% */}
      <Box sx={{ height: '1px', minHeight: '100vh' }}>
        <ErrorBoundary fallbackRender={ErrorFallback}>
          <React.Suspense fallback={<FullPageLoader />}>
            <BrowserRouter basename={basename}>
              <Routes>
                <Route path="/*" element={<EditorContent appId={APP_ID_LOCAL_MARKER} />} />
              </Routes>
            </BrowserRouter>
          </React.Suspense>
        </ErrorBoundary>
      </Box>
    </NoSsr>
  );
}
