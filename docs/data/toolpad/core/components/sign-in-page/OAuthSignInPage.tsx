import * as React from 'react';
import { AppProvider, SignInPage } from '@toolpad/core';

// preview-start
const providers = [
  { id: 'github', name: 'GitHub' },
  { id: 'google', name: 'Google' },
  { id: 'facebook', name: 'Facebook' },
];
// preview-end

export default function OAuthSignInPage() {
  return (
    // preview-start
    <AppProvider>
      <SignInPage
        signIn={(provider) => alert(`Signing in with "${provider.name}"`)}
        providers={providers}
      />
    </AppProvider>
    // preview-end
  );
}
