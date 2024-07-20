import * as React from 'react';
import NoSsr from '@mui/material/NoSsr';
import Head from 'docs/src/modules/components/Head';
import CssBaseline from '@mui/material/CssBaseline';
import BrandingCssVarsProvider from 'docs/src/BrandingCssVarsProvider';
import AppHeader from 'docs/src/layouts/AppHeader';
import AppHeaderBanner from 'docs/src/components/banner/AppHeaderBanner';
import GlobalStyles from '@mui/material/GlobalStyles';
import { Box, styled } from '@mui/material';
import CorePlayground from '../../../src/components/builder/CorePlayground';
import SignUpToast from '../../../src/components/landing/SignUpToast';

const Main = styled('main')({
  flex: 1,
});

export default function Builder() {
  return (
    <BrandingCssVarsProvider>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Head
          title="Toolpad: Low-code admin builder"
          description="Build apps with Material UI components, connect to data sources, APIs and build your internal tools 10x faster. Open-source and powered by MUI."
          card="/static/toolpad/marketing/toolpad-og.jpg"
        />
        <NoSsr>
          <SignUpToast />
        </NoSsr>
        <CssBaseline />
        <GlobalStyles styles={{ 'html, body, #__next': { width: '100%', height: '100%' } }} />
        <AppHeaderBanner />
        <AppHeader gitHubRepository="https://github.com/mui/mui-toolpad" />
        <Main id="main-content">
          <CorePlayground />
        </Main>
      </Box>
    </BrandingCssVarsProvider>
  );
}
