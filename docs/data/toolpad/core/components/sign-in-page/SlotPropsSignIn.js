import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';

const providers = [{ id: 'credentials', name: 'Email and Password' }];

export default function SlotPropsSignIn() {
  const theme = useTheme();
  return (
    <AppProvider theme={theme}>
      <SignInPage
        signIn={(provider, formData) =>
          alert(
            `Signing in with "${provider.name}" and credentials: ${formData.get('email')}, ${formData.get('password')}`,
          )
        }
        slotProps={{
          emailField: { variant: 'standard' },
          passwordField: { variant: 'standard' },
          submitButton: { variant: 'outlined' },
        }}
        providers={providers}
      />
    </AppProvider>
  );
}
