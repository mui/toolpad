import * as React from 'react';
import { AuthProvider, AppProvider, SignInPage } from '@toolpad/core';

// preview-start
const providers = [{ id: 'credentials', name: 'Email and Password' }];
// preview-end

const signIn: (
  provider: AuthProvider,
  formData: FormData,
) => Promise<string> = async (provider, formData) => {
  const promise = new Promise<string>((resolve) => {
    setTimeout(() => {
      alert(
        `Signing in with "${provider.name}" and credentials: ${formData.get('email')}, ${formData.get('password')}`,
      );
      resolve('');
    }, 300);
  });
  return promise;
};

export default function CredentialsSignInPage() {
  return (
    // preview-start
    <AppProvider>
      <SignInPage
        signIn={signIn}
        providers={providers}
        slotProps={{
          emailField: { autoFocus: false },
        }}
      />
    </AppProvider>
    // preview-end
  );
}
