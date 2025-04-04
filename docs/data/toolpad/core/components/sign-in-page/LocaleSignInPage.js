import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import hiIN from '@toolpad/core/locales/hiIN';

const providers = [
  { id: 'github', name: 'गिटहब' },
  { id: 'google', name: 'गूगल' },
  { id: 'credentials', name: 'ईमेल और पासवर्ड' },
];

const signIn = async (provider) => {
  const promise = new Promise((resolve) => {
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
        localeText={{
          providerSignInTitle: (provider) => `${provider} से साइन इन करें`,
        }}
      />
    </AppProvider>
    // preview-end
  );
}
