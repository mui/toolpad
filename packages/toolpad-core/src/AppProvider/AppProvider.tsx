import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import type { Theme } from '@emotion/react';

interface AppProviderProps {
  children: React.ReactNode;
  theme: Theme;
}

export function AppProvider({ children, theme }: AppProviderProps) {
  return (
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstarts an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </ThemeProvider>
  );
}
