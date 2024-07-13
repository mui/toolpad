import * as React from 'react';
import { AppProvider, SignInPage } from '@toolpad/core';

const providers = [{ id: 'credentials', name: 'Email and Password' }];

export default function ComponentsPropsSignIn() {
  return (
    <AppProvider>
      <SignInPage
        signIn={(provider, formData) =>
          alert(
            `Signing in with "${provider.name}" and credentials: ${formData.get('email')}, ${formData.get('password')}`,
          )
        }
        componentProps={{
          emailField: { autoFocus: false, variant: 'standard' },
          passwordField: { variant: 'standard' },
          submitButton: { variant: 'outlined' },
        }}
        providers={providers}
      />
    </AppProvider>
  );
}
