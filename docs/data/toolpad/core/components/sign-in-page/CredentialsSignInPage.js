import * as React from 'react';
import { SignInPage } from '@toolpad/core';

const providers = [{ id: 'credentials', name: 'Email and Password' }];

export default function CredentialsSignInPage() {
  return (
    <SignInPage
      signIn={(provider) => alert(`Signing in with "${provider.name}"`)}
      providers={providers}
    />
  );
}
