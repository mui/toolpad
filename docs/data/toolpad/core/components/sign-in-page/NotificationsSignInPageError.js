import * as React from 'react';
import { AppProvider, SignInPage } from '@toolpad/core';

const providers = [{ id: 'credentials', name: 'Email and password' }];

const signIn = async (provider, formData) => {
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      const email = formData?.get('email');
      const password = formData?.get('password');
      alert(
        `Signing in with "${provider.name}" and credentials: ${email}, ${password}`,
      );
      // preview-start
      resolve({
        type: 'CredentialsSignin',
        error: 'Invalid credentials.',
      });
      // preview-end
    }, 300);
  });
  return promise;
};

export default function NotificationsSignInPageError() {
  return (
    // preview-start
    <AppProvider>
      <SignInPage signIn={signIn} providers={providers} />
    </AppProvider>
    // preview-end
  );
}
