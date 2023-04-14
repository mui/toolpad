import { CircularProgress, Box, styled, CssBaseline } from '@mui/material';
import * as React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Head from 'next/head';
import NoSsr from '../components/NoSsr';
import AppEditor from './AppEditor';
import ErrorAlert from './AppEditor/PageEditor/ErrorAlert';
import { ToolpadContext } from '../ToolpadContext';
import { ThemeProvider, usePaletteMode } from '../ThemeContext';
import { getMetaThemeColor } from '../theme';

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

export interface ToolpadProps {
  basename: string;
  envVarNames: string[];
}

export default function Toolpad({ basename, envVarNames }: ToolpadProps) {
  const paletteMode = usePaletteMode();

  const toolpadContextValue = React.useMemo(
    () => ({
      envVarNames,
    }),
    [envVarNames],
  );

  return (
    <NoSsr>
      <ToolpadContext.Provider value={toolpadContextValue}>
        <ThemeProvider>
          <Head>
            {/* PWA primary color */}
            <meta
              name="theme-color"
              content={getMetaThemeColor(paletteMode)}
              media={`(prefers-color-scheme: ${paletteMode})`}
            />
          </Head>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          {/* Container that allows children to size to it with height: 100% */}
          <Box sx={{ height: '1px', minHeight: '100vh' }}>
            <ErrorBoundary fallbackRender={ErrorFallback}>
              <React.Suspense fallback={<FullPageLoader />}>
                <BrowserRouter basename={basename}>
                  <Routes>
                    <Route path="/*" element={<AppEditor />} />
                  </Routes>
                </BrowserRouter>
              </React.Suspense>
            </ErrorBoundary>
          </Box>
        </ThemeProvider>
      </ToolpadContext.Provider>
    </NoSsr>
  );
}
