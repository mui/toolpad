import type { LocaleText } from '../AppProvider';
import { getLocalization } from './getLocalization';

const en: Partial<LocaleText> = {
  // Account
  accountSignInLabel: 'Sign In',
  accountSignOutLabel: 'Sign Out',

  // AccountPreview
  accountTitle: 'Account',
  accountIconButtonLabel: 'Current User',
  // SignInPage
  signInTitle: 'Sign In',
  signInSubtitle: 'Welcome user, please sign in to continue',
  signInRememberMe: 'Remember Me',

  // Common authentication labels
  email: 'Email',
  password: 'Password',
  username: 'Username',
  passkey: 'Passkey',

  // Common action labels
  save: 'Save',
  cancel: 'Cancel',
  ok: 'Ok',
  or: 'Or',
  to: 'To',
  with: 'With',
  close: 'Close',
  delete: 'Delete',
  alert: 'Alert',
  confirm: 'Confirm',
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  info: 'Info',
};

export default getLocalization(en);
