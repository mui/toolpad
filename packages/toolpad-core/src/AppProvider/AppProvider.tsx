import * as React from 'react';
import PropTypes from 'prop-types';
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

function AppProvider(props: AppProviderProps) {
  const { children, theme, branding = null, navigation } = props;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrandingContext.Provider value={branding}>
        <NavigationContext.Provider value={navigation}>{children}</NavigationContext.Provider>
      </BrandingContext.Provider>
    </ThemeProvider>
  );
}

AppProvider.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  branding: PropTypes.shape({
    logo: PropTypes.node,
    title: PropTypes.string,
  }),
  /**
   * @ignore
   */
  children: PropTypes.node,
  /**
   * @ignore
   */
  navigation: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        children: PropTypes.arrayOf(
          PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.shape({
              kind: PropTypes.oneOf(['header']).isRequired,
              title: PropTypes.string.isRequired,
            }),
            PropTypes.shape({
              kind: PropTypes.oneOf(['divider']).isRequired,
            }),
          ]).isRequired,
        ),
        icon: PropTypes.node,
        kind: PropTypes.oneOf(['page']),
        path: PropTypes.string,
        title: PropTypes.string.isRequired,
      }),
      PropTypes.shape({
        kind: PropTypes.oneOf(['header']).isRequired,
        title: PropTypes.string.isRequired,
      }),
      PropTypes.shape({
        kind: PropTypes.oneOf(['divider']).isRequired,
      }),
    ]).isRequired,
  ).isRequired,
  /**
   * @ignore
   */
  theme: PropTypes.object.isRequired,
} as any;

export { AppProvider };
