import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignUpPage } from '@toolpad/core/SignUpPage';

import { useTheme } from '@mui/material/styles';

// preview-start
const providers = [{ id: 'credentials', name: 'Email and Password' }];
// preview-end

const signUp = async (provider, formData) => {
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      alert(
        `Signing up with "${provider.name}" and credentials: ${formData.get('email')}, ${formData.get('password')}`,
      );
      resolve();
    }, 300);
  });
  return promise;
};

export default function CredentialsSignUpPage() {
  const theme = useTheme();
  return (
    // preview-start
    <AppProvider theme={theme}>
      <SignUpPage
        signUp={signUp}
        providers={providers}
        slotProps={{ emailField: { autoFocus: false } }}
      />
    </AppProvider>
    // preview-end
  );
}
