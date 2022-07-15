import * as React from 'react';
import Head from 'docs/src/modules/components/Head';
import CssBaseline from '@mui/material/CssBaseline';
import BrandingProvider from 'docs/src/BrandingProvider';
import AppHeader from 'docs/src/layouts/AppHeader';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeaderBanner from 'docs/src/components/banner/AppHeaderBanner';
import ToolpadHero from '../../src/components/landing/ToolpadHero';

export default function Home() {
  return (
    <BrandingProvider>
      <Head
        title="Title"
        description="Description"
        card="/static/social-previews/toolpad-preview.jpg"
      />
      <CssBaseline />
      <AppHeaderBanner />
      <AppHeader />
      <main>
        <ToolpadHero />
      </main>
      <AppFooter />
    </BrandingProvider>
  );
}
