import * as React from 'react';

import { AppProvider, SignInPage } from '@toolpad/core';
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

export default function BrandingSignInPage() {
  const { mode } = useColorSchemeShim();
  const brandingDesignTokens = getDesignTokens(mode);
  const THEME = createTheme({
    ...brandingDesignTokens,
    palette: {
      ...brandingDesignTokens.palette,
      mode,
    },
  });

  return (
    // preview-start
    <AppProvider branding={BRANDING} theme={THEME}>
      <SignInPage
        signIn={(provider) => alert(`Signing in with "${provider.name}"`)}
        providers={providers}
      />
    </AppProvider>
    // preview-end
  );
}
