import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import {
  SignInPage,
  type AuthProvider,
  type AuthResponse,
} from '@toolpad/core/SignInPage';
import hiIN from '@toolpad/core/locales/hiIN';

const providers = [
  { id: 'github', name: 'GitHub' },
  { id: 'google', name: 'Google' },
  { id: 'credentials', name: 'Email and Password' },
];

const signIn: (provider: AuthProvider) => void | Promise<AuthResponse> = async (
  provider,
) => {
  const promise = new Promise<AuthResponse>((resolve) => {
    setTimeout(() => {
      console.log(`Sign in with ${provider.id}`);
      resolve({ error: 'This is a mock error message.' });
    }, 500);
  });
  return promise;
};

export default function LocaleSignInPage() {
  return (
    // preview-start
    <AppProvider
      localeText={hiIN.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <SignInPage
        signIn={signIn}
        providers={providers}
        localeText={{ signInTitle: 'लॉग इन करें' }}
      />
    </AppProvider>
    // preview-end
  );
}
