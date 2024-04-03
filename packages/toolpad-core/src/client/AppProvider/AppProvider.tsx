import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { NoSsr } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { Theme } from '@emotion/react';
import BrandingContext from '../context/BrandingContext';
import NavigationContext from '../context/NavigationContext';
import { Branding, Navigation } from '../../types';

interface AppProviderProps {
  children: React.ReactNode;
  theme: Theme;
  branding?: Branding | null;
  navigation: Navigation;
}

export default function AppProvider({
  children,
  theme,
  branding = null,
  navigation,
}: AppProviderProps) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstarts an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <BrandingContext.Provider value={branding}>
          <NavigationContext.Provider value={navigation}>
            {/* @TODO: Can probably remove NoSsr once we have non CSS-in-JS solution. */}
            <NoSsr>{children}</NoSsr>
          </NavigationContext.Provider>
        </BrandingContext.Provider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
