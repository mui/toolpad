import * as React from 'react';
import { ThemeProvider, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

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
