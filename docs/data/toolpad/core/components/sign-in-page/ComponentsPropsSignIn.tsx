import * as React from 'react';
import { SignInPage } from '@toolpad/core';

const providers = [{ id: 'credentials', name: 'Email and Password' }];

export default function ComponentsPropsSignIn() {
  return (
    <SignInPage
      signIn={(provider) => alert(`Signing in with "${provider.name}"`)}
      componentProps={{
        email: { autoFocus: false, variant: 'standard' },
        password: { variant: 'standard' },
        button: { variant: 'outlined' },
      }}
      providers={providers}
    />
  );
}
