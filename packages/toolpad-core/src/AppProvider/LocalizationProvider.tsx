'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import DEFAULT_LOCALE from '../locales/en';

export interface LocaleText {
  // Account
  accountSignInLabel: string;
  accountSignOutLabel: string;

  // AccountPreview
  accountPreviewIconButtonLabel: string;
  accountPreviewTitle: string;
  accountPreviewEmail: string;
  accountPreviewName: string;

  // SignInPage
  signInTitle: string;
  signInSubtitle: string;
  oauthSignInTitle: string;
  passkeySignInTitle: string;
  magicLinkSignInTitle: string;
  signInRememberMe: string;

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
}

export interface LocalizationProviderProps {
  children?: React.ReactNode;
  /**
   * Locale for components texts
   */
  localeText?: Partial<LocaleText>;
}

export const LocalizationContext = React.createContext<Partial<LocaleText>>({});

const LocalizationProvider = function LocalizationProvider(props: LocalizationProviderProps) {
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

LocalizationProvider.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  children: PropTypes.node,
  /**
   * Locale for components texts
   */
  localeText: PropTypes.shape({
    accountPreviewEmail: PropTypes.string,
    accountPreviewIconButtonLabel: PropTypes.string,
    accountPreviewName: PropTypes.string,
    accountPreviewTitle: PropTypes.string,
    accountSignInLabel: PropTypes.string,
    accountSignOutLabel: PropTypes.string,
    alert: PropTypes.string,
    cancel: PropTypes.string,
    close: PropTypes.string,
    confirm: PropTypes.string,
    delete: PropTypes.string,
    email: PropTypes.string,
    loading: PropTypes.string,
    magicLinkSignInTitle: PropTypes.string,
    oauthSignInTitle: PropTypes.string,
    ok: PropTypes.string,
    or: PropTypes.string,
    passkey: PropTypes.string,
    passkeySignInTitle: PropTypes.string,
    password: PropTypes.string,
    save: PropTypes.string,
    signInRememberMe: PropTypes.string,
    signInSubtitle: PropTypes.string,
    signInTitle: PropTypes.string,
    to: PropTypes.string,
    username: PropTypes.string,
    with: PropTypes.string,
  }),
} as any;

export { LocalizationProvider };
/**
 *
 * Demos:
 *
 * - [Sign-in Page](https://mui.com/toolpad/core/react-sign-in-page/)
 *
 * API:
 *
 * - [LocalizationProvider API](https://mui.com/toolpad/core/api/localization-provider)
 */
export function useLocaleText() {
  return React.useContext(LocalizationContext);
}
