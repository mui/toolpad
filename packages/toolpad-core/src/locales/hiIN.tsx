import type { LocaleText } from '../AppProvider';
import { getLocalization } from './getLocalization';

const hiINLabels: Partial<LocaleText> = {
  // Account
  accountSignInLabel: 'साइन इन करें',
  accountSignOutLabel: 'साइन आउट करें',

  // AccountPreview
  accountPreviewTitle: 'खाता',
  accountPreviewIconButtonLabel: 'वर्तमान उपयोगकर्ता',

  // SignInPage
  signInTitle: (brandingTitle?: string) =>
    brandingTitle ? `${brandingTitle} में साइन इन करें ` : `साइन इन करें`,
  signInSubtitle: 'स्वागत है उपयोगकर्ता, कृपया जारी रखने के लिए साइन इन करें',
  signInRememberMe: 'मुझे याद रखें',
  providerSignInTitle: (provider: string) => `${provider} से साइन इन करें`,

  // Common authentication labels
  email: 'ईमेल',
  password: 'पासवर्ड',
  username: 'उपयोगकर्ता नाम',
  passkey: 'पासकी',

  // Common action labels
  save: 'सहेजें',
  cancel: 'रद्द करें',
  ok: 'ठीक है',
  or: 'या',
  to: 'को',
  with: 'के साथ',
  close: 'बंद करें',
  delete: 'हटाएं',
  alert: 'सूचना',
  confirm: 'पुष्टि करें',
  loading: 'लोड हो रहा है...',
};

export const hiIN = getLocalization(hiINLabels);
