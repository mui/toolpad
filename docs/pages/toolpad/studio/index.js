import * as React from 'react';
import NoSsr from '@mui/material/NoSsr';
import Head from 'docs/src/modules/components/Head';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import BrandingCssVarsProvider from 'docs/src/BrandingCssVarsProvider';
import AppHeader from 'docs/src/layouts/AppHeader';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeaderBanner from 'docs/src/components/banner/AppHeaderBanner';
import Hero from '../../../src/components/landing-studio/Hero';
import HeroVideo from '../../../src/components/landing-studio/HeroVideo';
import SignUpToast from '../../../src/components/landing-studio/SignUpToast';
import UseCases from '../../../src/components/landing-studio/UseCases';
import CardGrid from '../../../src/components/landing-studio/CardGrid';
import Pricing from '../../../src/components/landing-studio/PricingTable';
import Marquee from '../../../src/components/landing-studio/Marquee';
import features from '../../../data/toolpad/studio/landing/features';
import studioUseCases from '../../../data/toolpad/studio/landing/useCases';
import marquee from '../../../data/toolpad/studio/landing/marquee';
import {
  Headline,
  plans,
  planInfo,
  rowHeaders,
  communityData,
  commercialData,
} from '../../../data/toolpad/studio/landing/pricing';

export default function Home() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="Toolpad: Low-code admin builder"
        description="Build apps with Material UI components, connect to data sources, APIs and build your internal tools 10x faster. Open-source and powered by Material UI."
        card="/static/toolpad/marketing/toolpad-og.jpg"
      />
      <NoSsr>
        <SignUpToast />
      </NoSsr>
      <CssBaseline />
      <AppHeaderBanner />
      <AppHeader gitHubRepository="https://github.com/mui/toolpad" />
      <main id="main-content">
        <Hero />
        <HeroVideo />
        <Divider />
        <UseCases content={studioUseCases} />
        <Divider />
        <CardGrid content={features} />
        <Divider />
        <Pricing
          Headline={Headline}
          plans={plans}
          planInfo={planInfo}
          rowHeaders={rowHeaders}
          commercialData={commercialData}
          communityData={communityData}
        />
        <Divider />
        <Marquee content={marquee} />
        <Divider />
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
