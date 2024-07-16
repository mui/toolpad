import * as React from 'react';
import { AppProvider, SignInPage } from '@toolpad/core';

const providers = [{ id: 'credentials', name: 'Email and password' }];

const signIn = async (provider, formData) => {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const email = formData?.get('email');
      const password = formData?.get('password');
      if (password === 'default') {
        reject(new Error(''));
      }
      if (password !== 'password') {
        reject(new Error('Invalid credentials.'));
      }
      alert(
        `Signing in with "${provider.name}" and credentials: ${email}, ${password}`,
      );
      resolve('Signed in!');
    }, 300);
  });
  return promise;
};

export default function NotificationsSignInPageError() {
  return (
    // preview-start
    <AppProvider>
      <SignInPage
        signIn={signIn}
        providers={providers}
        slotProps={{
          emailField: {
            autoFocus: false,
          },
        }}
      />
    </AppProvider>
    // preview-end
  );
}
