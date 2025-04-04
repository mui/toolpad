import * as React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';

const providers = [
  { id: 'github', name: 'GitHub' },
  { id: 'credentials', name: 'Email and Password' },
];

function RememberMeCheckbox() {
  const theme = useTheme();
  return (
    <FormControlLabel
      label="Remember me"
      control={
        <Checkbox
          name="remember"
          value="true"
          color="primary"
          sx={{ padding: 0.5, '& .MuiSvgIcon-root': { fontSize: 20 } }}
        />
      }
      slotProps={{
        typography: {
          color: 'textSecondary',
          fontSize: theme.typography.pxToRem(14),
        },
      }}
    />
  );
}

export default function SlotPropsSignIn() {
  const theme = useTheme();
  return (
    <AppProvider theme={theme}>
      <SignInPage
        signIn={(provider, formData) => {
          if (provider.id === 'credentials') {
            alert(
              `Signing in with "${provider.name}" and credentials: ${formData.get('email')}, ${formData.get('password')} and checkbox value: ${formData.get('tandc')}`,
            );
          } else {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve({ error: 'This is a fake error' });
              }, 1000);
            });
          }
          return undefined;
        }}
        slots={{ rememberMe: RememberMeCheckbox }}
        slotProps={{
          form: { noValidate: true },
          emailField: { variant: 'standard', autoFocus: false },
          passwordField: { variant: 'standard' },
          submitButton: { variant: 'outlined' },
          oAuthButton: { variant: 'contained' },
          rememberMe: {
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
