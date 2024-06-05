import * as React from 'react';
import BrandingCssVarsProvider from 'docs/src/BrandingCssVarsProvider';
import Hero from '../../src/components/landing2/Hero';
import Features from '../../src/components/landing2/Features';
import BuiltWith from '../../src/components/landing2/BuiltWith';

export default function Home() {
  return (
    <BrandingCssVarsProvider>
      <Hero />
      <Features />
      <BuiltWith />
    </BrandingCssVarsProvider>
  );
}
