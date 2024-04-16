import * as React from 'react';
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrandingContext.Provider value={branding}>
        <NavigationContext.Provider value={navigation}>{children}</NavigationContext.Provider>
      </BrandingContext.Provider>
    </ThemeProvider>
  );
}
