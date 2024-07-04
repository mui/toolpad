import * as React from 'react';
import { SignInPage } from '@toolpad/core';

const providers = [
  { id: 'github', name: 'GitHub' },
  { id: 'google', name: 'Google' },
  { id: 'credentials', name: 'Email and password' },
];

export default function BasicSignInPage() {
  return (
    <SignInPage
      signIn={(provider) => alert(`Signing in with "${provider.name}"`)}
      providers={providers}
    />
  );
}
