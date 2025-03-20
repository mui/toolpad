import * as React from 'react';
import Head from 'docs/src/modules/components/Head';
import BrandingCssVarsProvider from 'docs/src/BrandingCssVarsProvider';
import Divider from '@mui/material/Divider';
import CssBaseline from '@mui/material/CssBaseline';
import AppHeader from 'docs/src/layouts/AppHeader';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeaderBanner from 'docs/src/components/banner/AppHeaderBanner';
import Examples from '../../src/components/landing/Examples';
import Hero from '../../src/components/landing/Hero';
import Features from '../../src/components/landing/Features';
import BuiltWith from '../../src/components/landing/BuiltWith';
import StudioIntro from '../../src/components/landing/StudioIntro';

export default function Home() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="Toolpad Core: React components for dashboards"
        description="Toolpad Core offers the components needed for your next admin panel and internal tools project."
        card="/static/toolpad/marketing/toolpad-core-og.jpg"
      />
      <CssBaseline />
      <AppHeaderBanner />
      <AppHeader gitHubRepository="https://github.com/mui/toolpad" />
      <main id="main-content">
        <Hero />
        <Features />
        <Divider />
        <BuiltWith />
        <Divider />
        <Examples />
        <StudioIntro />
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
