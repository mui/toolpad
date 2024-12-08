'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme as createMuiTheme, Theme } from '@mui/material/styles';
import { NotificationsProvider } from '../useNotifications';
import { DialogsProvider } from '../useDialogs';
import {
  BrandingContext,
  NavigationContext,
  RouterContext,
  WindowContext,
} from '../shared/context';
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
  homeUrl?: string;
}

export interface NavigationPageItem {
  kind?: 'page';
  segment?: string;
  title?: string;
  icon?: React.ReactNode;
  pattern?: string;
  action?: React.ReactNode;
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

export interface Session {
  user?: {
    id?: string | null;
    name?: string | null;
    image?: string | null;
    email?: string | null;
  };
}

export interface Authentication {
  signIn: () => void;
  signOut: () => void;
}

export const AuthenticationContext = React.createContext<Authentication | null>(null);

export const SessionContext = React.createContext<Session | null>(null);

export type AppTheme = Theme | { light: Theme; dark: Theme };

export interface AppProviderProps {
  /**
   * The content of the app provider.
   */
  children: React.ReactNode;
  /**
   * [Theme or themes](https://mui.com/toolpad/core/react-app-provider/#theming) to be used by the app in light/dark mode. A [CSS variables theme](https://mui.com/material-ui/customization/css-theme-variables/overview/) is recommended.
   * @default createTheme()
   */
  theme?: AppTheme;
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
  /**
   * Session info about the current user.
   * @default null
   */
  session?: Session | null;
  /**
   * Authentication methods.
   * @default null
   */
  authentication?: Authentication | null;
  /**
   * The window where the application is rendered.
   * This is needed when rendering the app inside an iframe, for example.
   * @default window
   */
  window?: Window;
}

function createTheme(): Theme {
  return createMuiTheme({
    cssVariables: {
      colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    colorSchemes: { dark: true },
  });
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
    theme = createTheme(),
    branding = null,
    navigation = [],
    router = null,
    authentication = null,
    session = null,
    window: appWindow,
  } = props;

  return (
    <WindowContext.Provider value={appWindow}>
      <AuthenticationContext.Provider value={authentication}>
        <SessionContext.Provider value={session}>
          <RouterContext.Provider value={router}>
            <AppThemeProvider theme={theme} window={appWindow}>
              <NotificationsProvider>
                <DialogsProvider>
                  <BrandingContext.Provider value={branding}>
                    <NavigationContext.Provider value={navigation}>
                      {children}
                    </NavigationContext.Provider>
                  </BrandingContext.Provider>
                </DialogsProvider>
              </NotificationsProvider>
            </AppThemeProvider>
          </RouterContext.Provider>
        </SessionContext.Provider>
      </AuthenticationContext.Provider>
    </WindowContext.Provider>
  );
}

AppProvider.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Authentication methods.
   * @default null
   */
  authentication: PropTypes.shape({
    signIn: PropTypes.func.isRequired,
    signOut: PropTypes.func.isRequired,
  }),
  /**
   * Branding options for the app.
   * @default null
   */
  branding: PropTypes.shape({
    homeUrl: PropTypes.string,
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
        action: PropTypes.node,
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
        pattern: PropTypes.string,
        segment: PropTypes.string,
        title: PropTypes.string,
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
  router: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    pathname: PropTypes.string.isRequired,
    searchParams: PropTypes.instanceOf(URLSearchParams).isRequired,
  }),
  /**
   * Session info about the current user.
   * @default null
   */
  session: PropTypes.shape({
    user: PropTypes.shape({
      email: PropTypes.string,
      id: PropTypes.string,
      image: PropTypes.string,
      name: PropTypes.string,
    }),
  }),
  /**
   * [Theme or themes](https://mui.com/toolpad/core/react-app-provider/#theming) to be used by the app in light/dark mode. A [CSS variables theme](https://mui.com/material-ui/customization/css-theme-variables/overview/) is recommended.
   * @default createTheme()
   */
  theme: PropTypes.object,
  /**
   * The window where the application is rendered.
   * This is needed when rendering the app inside an iframe, for example.
   * @default window
   */
  window: PropTypes.object,
} as any;

export { AppProvider };
