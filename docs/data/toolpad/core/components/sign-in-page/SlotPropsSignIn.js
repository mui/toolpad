import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage, RememberMeCheckbox } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';

const providers = [{ id: 'credentials', name: 'Email and Password' }];

export default function SlotPropsSignIn() {
  const theme = useTheme();
  return (
    <AppProvider theme={theme}>
      <SignInPage
        signIn={(provider, formData) =>
          alert(
            `Signing in with "${provider.name}" and credentials: ${formData.get('email')}, ${formData.get('password')} and checkbox value: ${formData.get('tandc')}`,
          )
        }
        slots={{ checkbox: RememberMeCheckbox }}
        slotProps={{
          form: { noValidate: true },
          emailField: { variant: 'standard', autoFocus: false },
          passwordField: { variant: 'standard' },
          submitButton: { variant: 'outlined' },
          checkbox: {
            control: (
              <Checkbox
                name="tandc"
                value="true"
                color="primary"
                sx={{ py: 1, px: 0.5, '& .MuiSvgIcon-root': { fontSize: 20 } }}
              />
            ),
            color: 'textSecondary',
            label: 'I agree with the T&C',
          },
        }}
        providers={providers}
      />
    </AppProvider>
  );
}
