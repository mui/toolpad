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

  // SignInPage
  signInTitle: string | ((brandingTitle?: string) => string);
  signInSubtitle: string;
  providerSignInTitle: (provider: string) => string;
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

  // CRUD
  createNewButtonLabel: string;
  reloadButtonLabel: string;
  createLabel: string;
  createSuccessMessage: string;
  createErrorMessage: string;
  editLabel: string;
  editSuccessMessage: string;
  editErrorMessage: string;
  deleteLabel: string;
  deleteConfirmTitle: string;
  deleteConfirmMessage: string;
  deleteConfirmLabel: string;
  deleteCancelLabel: string;
  deleteSuccessMessage: string;
  deleteErrorMessage: string;
  deletedItemMessage: string;
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
    accountPreviewIconButtonLabel: PropTypes.string,
    accountPreviewTitle: PropTypes.string,
    accountSignInLabel: PropTypes.string,
    accountSignOutLabel: PropTypes.string,
    alert: PropTypes.string,
    cancel: PropTypes.string,
    close: PropTypes.string,
    confirm: PropTypes.string,
    createErrorMessage: PropTypes.string,
    createLabel: PropTypes.string,
    createNewButtonLabel: PropTypes.string,
    createSuccessMessage: PropTypes.string,
    delete: PropTypes.string,
    deleteCancelLabel: PropTypes.string,
    deleteConfirmLabel: PropTypes.string,
    deleteConfirmMessage: PropTypes.string,
    deleteConfirmTitle: PropTypes.string,
    deletedItemMessage: PropTypes.string,
    deleteErrorMessage: PropTypes.string,
    deleteLabel: PropTypes.string,
    deleteSuccessMessage: PropTypes.string,
    editErrorMessage: PropTypes.string,
    editLabel: PropTypes.string,
    editSuccessMessage: PropTypes.string,
    email: PropTypes.string,
    loading: PropTypes.string,
    ok: PropTypes.string,
    or: PropTypes.string,
    passkey: PropTypes.string,
    password: PropTypes.string,
    providerSignInTitle: PropTypes.func,
    reloadButtonLabel: PropTypes.string,
    save: PropTypes.string,
    signInRememberMe: PropTypes.string,
    signInSubtitle: PropTypes.string,
    signInTitle: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
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
