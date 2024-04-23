import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { Theme } from '@emotion/react';

export interface Branding {
  name?: string;
  logo?: React.ReactNode;
}

export interface NavigationItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  items?: (Omit<NavigationItem, 'items'> & { path: string })[];
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export type Navigation = NavigationSection[];

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
