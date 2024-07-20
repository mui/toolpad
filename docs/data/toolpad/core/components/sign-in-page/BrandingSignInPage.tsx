import * as React from 'react';
import { AuthProvider, AppProvider, SignInPage } from '@toolpad/core';
import { createTheme } from '@mui/material/styles';
import { useColorSchemeShim } from 'docs/src/modules/components/ThemeContext';
import { getDesignTokens } from './brandingTheme';

const providers = [
  { id: 'github', name: 'GitHub' },
  { id: 'google', name: 'Google' },
  { id: 'credentials', name: 'Email and Password' },
];

const BRANDING = {
  logo: (
    <img
      src="https://mui.com/static/logo.svg"
      alt="MUI logo"
      style={{ height: 24 }}
    />
  ),
  title: 'MUI',
};

const signIn: (provider: AuthProvider) => void = async (provider) => {
  const promise = new Promise<void>((resolve) => {
    setTimeout(() => {
      alert(`Signing in with "${provider.name}"`);
      resolve();
    }, 300);
  });
  return promise;
};

export default function BrandingSignInPage() {
  const { mode, systemMode } = useColorSchemeShim();
  const calculatedMode = (mode === 'system' ? systemMode : mode) ?? 'light';
  const brandingDesignTokens = getDesignTokens(calculatedMode);
  const THEME = createTheme({
    ...brandingDesignTokens,
    palette: {
      ...brandingDesignTokens.palette,
      mode: calculatedMode,
    },
  });

  return (
    // preview-start
    <AppProvider branding={BRANDING} theme={THEME}>
      <SignInPage signIn={signIn} providers={providers} />
    </AppProvider>
    // preview-end
  );
}
