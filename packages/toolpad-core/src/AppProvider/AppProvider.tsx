'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { Theme } from '@mui/material/styles';
import type { AtLeastOne } from '@toolpad/utils/types';
import { baseThemeLight, baseThemeDark } from '../themes';
import { AppThemeProvider } from './AppThemeProvider';

export interface NavigateOptions {
  history?: 'auto' | 'push' | 'replace';
}

export interface Navigate {
  (url: string | URL, options?: NavigateOptions): void;
}

/**
 * Abstract router used by Toolpad components.
 */
export interface Router {
  pathname: string;
  searchParams: URLSearchParams;
  navigate: Navigate;
}

export interface Branding {
  title?: string;
  logo?: React.ReactNode;
}

export interface NavigationPageItem {
  kind?: 'page';
  title: string;
  slug?: string;
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

// TODO: hide these contexts from public API

export const BrandingContext = React.createContext<Branding | null>(null);

export const NavigationContext = React.createContext<Navigation>([]);

export const RouterContext = React.createContext<Router | null>(null);

export interface AppProviderProps {
  /**
   * The content of the app provider.
   */
  children: React.ReactNode;
  /**
   * [Themes](https://mui.com/material-ui/customization/theming/) to be used by the app in light/dark mode.
   * @default { light: baseThemeLight, dark: baseThemeDark }
   */
  themes?: AtLeastOne<{
    light: Theme;
    dark: Theme;
  }>;
  /**
   * Branding options for the app.
   * @default null
   */
  branding?: Branding | null;
  /**
   * Navigation definition for the app.
   * @default []
   */
  navigation?: Navigation;

  /**
   * Router implementation used inside Toolpad components.
   * @default null
   */
  router?: Router;
}

/**
 *
 * Demos:
 *
 * - [App Provider](https://mui.com/toolpad/core/react-app-provider/)
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 *
 * API:
 *
 * - [AppProvider API](https://mui.com/toolpad/core/api/app-provider)
 */
function AppProvider(props: AppProviderProps) {
  const {
    children,
    themes = { light: baseThemeLight, dark: baseThemeDark },
    branding = null,
    navigation = [],
    router = null,
  } = props;

  return (
    <RouterContext.Provider value={router}>
      <AppThemeProvider themes={themes}>
        <BrandingContext.Provider value={branding}>
          <NavigationContext.Provider value={navigation}>{children}</NavigationContext.Provider>
        </BrandingContext.Provider>
      </AppThemeProvider>
    </RouterContext.Provider>
  );
}

AppProvider.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Branding options for the app.
   * @default null
   */
  branding: PropTypes.shape({
    logo: PropTypes.node,
    title: PropTypes.string,
  }),
  /**
   * The content of the app provider.
   */
  children: PropTypes.node,
  /**
   * Navigation definition for the app.
   * @default []
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
        slug: PropTypes.string,
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
  ),
  /**
   * Router implementation used inside Toolpad components.
   * @default null
   */
  router: PropTypes /* @typescript-to-proptypes-ignore */.shape({
    navigate: PropTypes.func.isRequired,
    pathname: PropTypes.string.isRequired,
    searchParams: PropTypes.instanceOf(URLSearchParams),
  }),
  /**
   * [Theme](https://mui.com/material-ui/customization/theming/) used by the app.
   * @default baseTheme
   */
  theme: PropTypes.object,
} as any;

export { AppProvider };
