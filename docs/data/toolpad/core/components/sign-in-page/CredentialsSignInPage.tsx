import * as React from 'react';
import { AppProvider, SignInPage } from '@toolpad/core';

const providers = [{ id: 'credentials', name: 'Email and Password' }];

export default function CredentialsSignInPage() {
  return (
    <AppProvider>
      <SignInPage
        signIn={(provider, formData) =>
          alert(
            `Signing in with "${provider.name}" and credentials: ${formData.get('email')}, ${formData.get('password')}`,
          )
        }
        providers={providers}
        componentProps={{
          emailField: { autoFocus: false },
        }}
      />
    </AppProvider>
  );
}
