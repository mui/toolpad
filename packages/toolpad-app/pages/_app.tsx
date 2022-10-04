import * as React from 'react';
import Head from 'next/head';
import Script from 'next/script';
import App, { AppContext, AppProps, NextWebVitalsMetric } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { LicenseInfo } from '@mui/x-data-grid-pro';
import config from '../src/config';
import theme from '../src/theme';
import createEmotionCache from '../src/createEmotionCache';
import { MUI_X_PRO_LICENSE } from '../src/constants';
import { queryClient } from '../src/api';
import { reportWebVitalsToGA } from '../src/utils/ga';

import '../src/appStyles.css';

LicenseInfo.setLicenseKey(MUI_X_PRO_LICENSE);

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export const reportWebVitals = (metric: NextWebVitalsMetric): void => {
  reportWebVitalsToGA(metric);
};

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <React.Fragment>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>My page</title>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <Component {...pageProps} />
          </ThemeProvider>
        </QueryClientProvider>
      </CacheProvider>
      {/* Google reCAPTCHA */}
      {config.recaptchaSiteKey ? (
        <Script
          async
          strategy="afterInteractive"
          src={`https://www.google.com/recaptcha/api.js?render=${config.recaptchaSiteKey}`}
        />
      ) : null}
    </React.Fragment>
  );
}

// We purposefully call getInitialProps to disable Next.js automatic static optimization
// This forces the custom Document in ./_document.tsx to be serverside rendered on every load
// which is needed for the runtime config to initialize
MyApp.getInitialProps = async (appContext: AppContext) => {
  return App.getInitialProps(appContext);
};
