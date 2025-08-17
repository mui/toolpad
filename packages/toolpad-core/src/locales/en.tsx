import type { LocaleText } from '../AppProvider';
import { getLocalization } from './getLocalization';

const enLabels: LocaleText = {
  // Account
  accountSignInLabel: 'Sign In',
  accountSignOutLabel: 'Sign Out',

  // AccountPreview
  accountPreviewTitle: 'Account',
  accountPreviewIconButtonLabel: 'Current User',

  // SignInPage
  signInTitle: (brandingTitle?: string) =>
    brandingTitle ? `Sign in to ${brandingTitle}` : 'Sign in',
  signInSubtitle: 'Welcome user, please sign in to continue',
  signInRememberMe: 'Remember Me',
  providerSignInTitle: (provider: string) => `Sign in with ${provider}`,

  // SignUpPage
  signUpTitle: (brandingTitle?: string) =>
    brandingTitle ? `Sign up to ${brandingTitle}` : 'Sign up',
  signUpSubtitle: 'Welcome user, please sign up to continue',
  providerSignUpTitle: (provider: string) => `Sign up with ${provider}`,
  passwordsDoNotMatch: 'Passwords do not match',
  confirmPassword: 'Confirm Password',
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  agree: 'I agree to the',

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
  and: 'And',

  // CRUD
  createNewButtonLabel: 'Create new',
  reloadButtonLabel: 'Reload data',
  createLabel: 'Create',
  createSuccessMessage: 'Item created successfully.',
  createErrorMessage: 'Failed to create item. Reason:',
  editLabel: 'Edit',
  editSuccessMessage: 'Item edited successfully.',
  editErrorMessage: 'Failed to edit item. Reason:',
  deleteLabel: 'Delete',
  deleteConfirmTitle: 'Delete item?',
  deleteConfirmMessage: 'Do you wish to delete this item?',
  deleteConfirmLabel: 'Delete',
  deleteCancelLabel: 'Cancel',
  deleteSuccessMessage: 'Item deleted successfully.',
  deleteErrorMessage: 'Failed to delete item. Reason:',
  deletedItemMessage: 'This item has been deleted.',
};

export default getLocalization(enLabels);
