import * as React from 'react';
import { AppProvider, SignInPage } from '@toolpad/core';

const providers = [
  { id: 'github', name: 'GitHub' },
  { id: 'google', name: 'Google' },
  { id: 'facebook', name: 'Facebook' },
];

const signIn = async (provider) => {
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      alert(`Signing in with "${provider.name}"`);
      if (provider.id === 'github') {
        resolve('');
      } else if (provider.id === 'google') {
        resolve('Custom message for Google.');
      } else {
        resolve('Signed in!');
      }
    }, 300);
  });
  return promise;
};

export default function NotificationsSignInPageSuccess() {
  return (
    // preview-start
    <AppProvider>
      <SignInPage signIn={signIn} providers={providers} />
    </AppProvider>
    // preview-end
  );
}
