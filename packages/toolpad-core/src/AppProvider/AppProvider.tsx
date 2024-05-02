import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { Theme } from '@emotion/react';

export interface Branding {
  title?: string;
  logo?: React.ReactNode;
}

export interface NavigationPageItem {
  kind?: 'page';
  title: string;
  path?: string;
  icon?: React.ReactNode;
  children?: Navigation;
}

export interface NavigationSubheaderItem {
  kind: 'header';
  title: string;
}

export interface NavigationDividerItem {
  kind: 'divider';
}

export type NavigationItem = NavigationPageItem | NavigationSubheaderItem | NavigationDividerItem;

export type Navigation = NavigationItem[];

export const BrandingContext = React.createContext<Branding | null>(null);

export const NavigationContext = React.createContext<Navigation>([]);

interface AppProviderProps {
  children: React.ReactNode;
  theme: Theme;
  branding?: Branding | null;
  navigation: Navigation;
}

export function AppProvider({ children, theme, branding = null, navigation }: AppProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrandingContext.Provider value={branding}>
        <NavigationContext.Provider value={navigation}>{children}</NavigationContext.Provider>
      </BrandingContext.Provider>
    </ThemeProvider>
  );
}
