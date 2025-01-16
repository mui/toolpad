import * as React from 'react';
import { SignInPage } from '@toolpad/core/SignInPage';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useTheme } from '@mui/material/styles';

const providers = [{ id: 'nodemailer', name: 'Email' }];

const signIn = async (provider) => {
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Sign in with ${provider.id}`);
      // preview-start
      resolve({
        success: 'Check your email for a verification link.',
      });
      // preview-end
    }, 500);
  });
  return promise;
};

export default function MagicLinkAlertSignInPage() {
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
