import type { LocaleText } from '../AppProvider';
import { getLocalization } from './getLocalization';

const en: LocaleText = {
  // Account
  accountSignInLabel: 'Sign In',
  accountSignOutLabel: 'Sign Out',

  // AccountPreview
  accountPreviewTitle: 'Account',
  accountPreviewIconButtonLabel: 'Current User',

  // SignInPage
  signInTitle: 'Sign In',
  signInSubtitle: 'Welcome user, please sign in to continue',
  signInRememberMe: 'Remember Me',
  oauthSignInTitle: 'Sign in with OAuth',
  passkeySignInTitle: 'Sign in with Passkey',
  magicLinkSignInTitle: 'Sign in with Magic Link',

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
};

export default getLocalization(en);
