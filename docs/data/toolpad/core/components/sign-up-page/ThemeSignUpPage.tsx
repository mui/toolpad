import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignUpPage } from '@toolpad/core/SignUpPage';
import type { AuthProvider, AuthResponse } from '@toolpad/core/auth';
import { createTheme } from '@mui/material/styles';
import { useColorSchemeShim } from 'docs/src/modules/components/ThemeContext';
import { getDesignTokens, inputsCustomizations } from '../sign-in-page/customTheme';

const providers = [
  { id: 'github', name: 'GitHub' },
  { id: 'google', name: 'Google' },
  { id: 'credentials', name: 'Email and Password' },
];

const signUp: (provider: AuthProvider) => void | Promise<AuthResponse> = async (
  provider,
) => {
  const promise = new Promise<AuthResponse>((resolve) => {
    setTimeout(() => {
      console.log(`Sign up with ${provider.id}`);
      resolve({ error: 'This is a mock error message.' });
    }, 500);
  });
  return promise;
};

export default function ThemeSignUpPage() {
  const { mode, systemMode } = useColorSchemeShim();
  const calculatedMode = (mode === 'system' ? systemMode : mode) ?? 'light';
  const brandingDesignTokens = getDesignTokens(calculatedMode);
  // preview-start
  const THEME = createTheme({
    ...brandingDesignTokens,
    palette: {
      ...brandingDesignTokens.palette,
      mode: calculatedMode,
    },
    components: {
      ...inputsCustomizations,
    },
  });
  // preview-end

  return (
    // preview-start
    <AppProvider theme={THEME}>
      <SignUpPage
        signUp={signUp}
        providers={providers}
        sx={{
          '& form > .MuiStack-root': {
            marginTop: '2rem',
            rowGap: '0.5rem',
          },
        }}
      />
    </AppProvider>
    // preview-end
  );
}
