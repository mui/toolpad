import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import {
  AuthProvider,
  SignUpActionResponse,
  SignUpPage,
} from '@toolpad/core/AuthPage';
import { useTheme } from '@mui/material/styles';

// preview-start
const providers = [
  { id: 'github', name: 'GitHub' },
  { id: 'google', name: 'Google' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'twitter', name: 'Twitter' },
  { id: 'linkedin', name: 'LinkedIn' },
];

// preview-end

const signUp = async (provider: AuthProvider): Promise<SignUpActionResponse> => {
  // preview-start
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Sign up with ${provider.id}`);
      resolve({ error: 'This is a fake error' } as SignUpActionResponse);
    }, 500);
  }) as Promise<SignUpActionResponse>;
  // preview-end
  return promise;
};

export default function OAuthSignUpPage() {
  const theme = useTheme();
  return (
    // preview-start
    <AppProvider theme={theme}>
      <SignUpPage signUp={signUp} providers={providers} />
    </AppProvider>
    // preview-end
  );
}
