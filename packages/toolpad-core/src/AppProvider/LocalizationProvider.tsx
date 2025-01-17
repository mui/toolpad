'use client';
import * as React from 'react';
import { useThemeProps } from '@mui/material/styles';

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
  const { localeText: propsLocaleText, ...otherInProps } = props;

  const themeProps: LocalizationProviderProps = useThemeProps({
    // We don't want to pass the `localeText` prop to the theme, that way it will always return the theme value,
    // We will then merge this theme value with our value manually
    props: otherInProps,
    name: 'MuiLocalizationProvider',
  });

  const { children, localeText: themeLocaleText } = themeProps;

  const localeText = React.useMemo(
    () => ({ ...themeLocaleText, ...propsLocaleText }),
    [themeLocaleText, propsLocaleText],
  );

  return <LocalizationContext.Provider value={localeText}>{children}</LocalizationContext.Provider>;
};

export function useLocaleText() {
  return React.useContext(LocalizationContext);
}
