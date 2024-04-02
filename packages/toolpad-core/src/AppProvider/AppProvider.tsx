import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { NoSsr } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { Theme } from '@emotion/react';

interface AppProviderProps {
  children: React.ReactNode;
  theme: Theme;
}

export default function AppProvider({ children, theme }: AppProviderProps) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstarts an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {/* @TODO: Can probably remove NoSsr once we have non CSS-in-JS solution. */}
        <NoSsr>{children}</NoSsr>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
