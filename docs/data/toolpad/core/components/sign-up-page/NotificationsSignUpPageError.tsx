import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import {
  SignUpPage,
  type AuthProvider,
  type SignUpActionResponse,
} from '@toolpad/core/AuthPage';
import { useTheme } from '@mui/material/styles';

const providers = [{ id: 'credentials', name: 'Email and password' }];

const signUp: (
  provider: AuthProvider,
  formData?: FormData,
) => Promise<SignUpActionResponse> | void = async (provider, formData) => {
  const promise = new Promise<SignUpActionResponse>((resolve) => {
    setTimeout(() => {
      const email = formData?.get('email');
      const password = formData?.get('password');
      alert(
        `Signing up with "${provider.name}" and credentials: ${email}, ${password}`,
      );
      // preview-start
      resolve({
        error: 'Invalid credentials.',
      });
      // preview-end
    }, 300);
  });
  return promise;
};

export default function NotificationsSignUpPageError() {
  const theme = useTheme();
  return (
    // preview-start
    <AppProvider theme={theme}>
      <SignUpPage
        signUp={signUp}
        providers={providers}
        slotProps={{ emailField: { autoFocus: false }, form: { noValidate: true } }}
      />
    </AppProvider>
    // preview-end
  );
}
