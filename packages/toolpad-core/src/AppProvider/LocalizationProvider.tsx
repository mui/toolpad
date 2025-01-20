'use client';
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import DEFAULT_LOCALE from '../locales/en';

export type LocaleText = {
  // Account
  accountSignInLabel: string;
  accountSignOutLabel: string;
  // AccountPreview
  accountTitle: string;
  accountIconButtonLabel: string;

  // SignInPage
  signInTitle: string;
  signInSubtitle: string;
  oauthSignInTitle: string;
  passkeySignInTitle: string;
  magicLinkSignInTitle: string;
  signInRememberMe: string;

  // Error messages
  errorAccessDenied: string;
  errorCallbackRoute: string;
  errorMissingSecret: string;
  errorAuthentication: string;

  // Common authentication labels
  email: string;
  passkey: string;
  username: string;
  password: string;

  // Common action labels
  or: string;
  to: string;
  with: string;
  save: string;
  cancel: string;
  ok: string;
  close: string;
  delete: string;
  alert: string;
  confirm: string;
  loading: string;
  error: string;
  success: string;
  warning: string;
  info: string;

  // Navigation
  goBack: string;
  goHome: string;

  // Form validation
  required: string;
  invalid: string;

  // Account Preview
  accountPreviewTitle: string;
  accountPreviewEmail: string;
  accountPreviewName: string;

  // Dashboard Layout
  dashboardTitle: string;
  dashboardWelcome: string;
  dashboardSettings: string;
  dashboardLogout: string;

  // Error boundaries
  errorBoundaryTitle: string;
  errorBoundaryDescription: string;
  errorBoundaryRetry: string;
};

export interface LocalizationProviderProps {
  children?: React.ReactNode;
  /**
   * Locale for components texts
   */
  localeText?: Partial<LocaleText>;
}

export const LocalizationContext = React.createContext<Partial<LocaleText>>({});

export const LocalizationProvider = function LocalizationProvider(
  props: LocalizationProviderProps,
) {
  const { localeText: propsLocaleText, children } = props;

  const theme = useTheme();
  // @ts-ignore
  const themeLocaleText = theme?.components?.MuiLocalizationProvider?.defaultProps?.localeText;

  const defaultLocaleText =
    DEFAULT_LOCALE.components.MuiLocalizationProvider.defaultProps.localeText;

  /* The order of overrides is:
   * 1. The `localeText` prop of the `AppProvider` supersedes
   * 2. The localeText provided as an argument to the `createTheme` function, which supersedes
   * 3. The default locale text
   */

  const localeText = React.useMemo(
    () => ({ ...defaultLocaleText, ...themeLocaleText, ...propsLocaleText }),
    [defaultLocaleText, themeLocaleText, propsLocaleText],
  );

  return <LocalizationContext.Provider value={localeText}>{children}</LocalizationContext.Provider>;
};

export function useLocaleText() {
  return React.useContext(LocalizationContext);
}
