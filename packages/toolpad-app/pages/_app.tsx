import * as React from 'react';
import Head from 'next/head';
import App, { AppContext, AppProps } from 'next/app';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { LicenseInfo } from '@mui/x-data-grid-pro';
import createEmotionCache from '../src/createEmotionCache';
import { MUI_X_PRO_LICENSE } from '../src/constants';
import { queryClient } from '../src/api';
import '../src/appStyles.css';
import 'perf-cascade/dist/perf-cascade.css';

import appleTouchIcon from '../public/apple-touch-icon.png';
import favicon32 from '../public/favicon-32x32.png';
import favicon16 from '../public/favicon-16x16.png';

LicenseInfo.setLicenseKey(MUI_X_PRO_LICENSE);

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>My page</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="apple-touch-icon" sizes="180x180" href={appleTouchIcon.src} />
        <link rel="icon" type="image/png" sizes="32x32" href={favicon32.src} />
        <link rel="icon" type="image/png" sizes="16x16" href={favicon16.src} />
      </Head>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </CacheProvider>
  );
}

// We purposefully call getInitialProps to disable Next.js automatic static optimization
// This forces the custom Document in ./_document.tsx to be serverside rendered on every load
// which is needed for the runtime config to initialize
MyApp.getInitialProps = async (appContext: AppContext) => {
  return App.getInitialProps(appContext);
};
