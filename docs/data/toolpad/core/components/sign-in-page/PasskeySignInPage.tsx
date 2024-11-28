import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage, AuthProvider } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';
// preview-start
const providers = [{ id: 'passkey', name: 'Passkey' }];
// preview-end

const signIn: (provider: AuthProvider) => void = async (provider) => {
  const promise = new Promise<void>((resolve) => {
    setTimeout(() => {
      alert(`Signing in with ${provider.id}`);
      resolve();
    }, 500);
  });
  return promise;
};

export default function PasskeySignInPage() {
  const theme = useTheme();
  return (
    // preview-start
    <AppProvider theme={theme}>
      <SignInPage
        signIn={signIn}
        providers={providers}
        slotProps={{ emailField: { autoFocus: false } }}
      />
    </AppProvider>
    // preview-end
  );
}
