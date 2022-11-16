import * as React from 'react';
import NoSsr from '@mui/material/NoSsr';
import Head from 'docs/src/modules/components/Head';
import CssBaseline from '@mui/material/CssBaseline';
import BrandingProvider from 'docs/src/BrandingProvider';
import AppHeader from 'docs/src/layouts/AppHeader';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeaderBanner from 'docs/src/components/banner/AppHeaderBanner';
import ToolpadHero from '../../src/components/landing/Hero';
import SignUpToast from '../../src/components/landing/SignUpToast';
import CardGrid from '../../src/components/landing/CardGrid';
import Banner from '../../src/components/landing/Banner';
import Pricing from '../../src/components/landing/PricingTable';
import Marquee from '../../src/components/landing/Marquee';
import features from '../../src/content/features';
import { action, category, title, description, href, label } from '../../src/content/upvote';
import useCases from '../../src/content/useCases';
import marquee from '../../src/content/marquee';
import {
  Headline,
  plans,
  planInfo,
  rowHeaders,
  communityData,
  commercialData,
} from '../../src/content/pricing';

export default function Home() {
  return (
    <BrandingProvider>
      <Head
        title="MUI Toolpad: Low-code, admin builder"
        description="Build apps with MUI components, connect to data sources, APIs and build your internal tools 10x faster. Open-source and powered by MUI."
        card="/static/social-previews/toolpad-preview.jpg"
      />
      <NoSsr>
        <SignUpToast />
      </NoSsr>
      <CssBaseline />
      <AppHeaderBanner />
      <AppHeader gitHubRepository="https://github.com/mui/mui-toolpad" />
      <main id="main-content">
        <ToolpadHero />
        <CardGrid content={features} />
        <Banner
          action={action}
          category={category}
          title={title}
          description={description}
          href={href}
          label={label}
          docs={false}
        />
        <CardGrid content={useCases} />
        <Pricing
          Headline={Headline}
          plans={plans}
          planInfo={planInfo}
          rowHeaders={rowHeaders}
          commercialData={commercialData}
          communityData={communityData}
        />
        <Marquee content={marquee} />
      </main>
      <AppFooter />
    </BrandingProvider>
  );
}
