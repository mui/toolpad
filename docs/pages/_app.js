import 'docs/src/modules/components/bootstrap';
// --- Post bootstrap -----
import * as React from 'react';
import { loadCSS } from 'fg-loadcss/src/loadCSS';
import NextHead from 'next/head';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { LicenseInfo } from '@mui/x-data-grid-pro';
import PageContext from 'docs/src/modules/components/PageContext';
import GoogleAnalytics from 'docs/src/modules/components/GoogleAnalytics';
import { ThemeProvider } from 'docs/src/modules/components/ThemeContext';
import { CodeVariantProvider } from 'docs/src/modules/utils/codeVariant';
import { CodeCopyProvider } from 'docs/src/modules/utils/CodeCopy';
import DocsStyledEngineProvider from 'docs/src/modules/utils/StyledEngineProvider';
import { pathnameToLanguage } from 'docs/src/modules/utils/helpers';
import createEmotionCache from 'docs/src/createEmotionCache';
import findActivePage from 'docs/src/modules/utils/findActivePage';
import getProductInfoFromUrl from 'docs/src/modules/utils/getProductInfoFromUrl';
import toolpadPkgJson from '@toolpad/studio/package.json';
import { DocsProvider } from '@mui/docs/DocsProvider';
import { mapTranslations } from '@mui/docs/i18n';
import toolpadStudioPages from '../data/toolpad/studio/pages';
import toolpadCorePages from '../data/toolpad/core/pages';

import config from '../config';

const clientSideEmotionCache = createEmotionCache();

let reloadInterval;
LicenseInfo.setLicenseKey(process.env.NEXT_PUBLIC_MUI_LICENSE);

// Avoid infinite loop when "Upload on reload" is set in the Chrome sw dev tools.
function lazyReload() {
  clearInterval(reloadInterval);
  reloadInterval = setInterval(() => {
    if (document.hasFocus()) {
      window.location.reload();
    }
  }, 100);
}

// Inspired by
// https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
function forcePageReload(registration) {
  // console.log('already controlled?', Boolean(navigator.serviceWorker.controller));

  if (!navigator.serviceWorker.controller) {
    // The window client isn't currently controlled so it's a new service
    // worker that will activate immediately.
    return;
  }

  // console.log('registration waiting?', Boolean(registration.waiting));
  if (registration.waiting) {
    // SW is waiting to activate. Can occur if multiple clients open and
    // one of the clients is refreshed.
    registration.waiting.postMessage('skipWaiting');
    return;
  }

  function listenInstalledStateChange() {
    registration.installing.addEventListener('statechange', (event) => {
      // console.log('statechange', event.target.state);
      if (event.target.state === 'installed' && registration.waiting) {
        // A new service worker is available, inform the user
        registration.waiting.postMessage('skipWaiting');
      } else if (event.target.state === 'activated') {
        // Force the control of the page by the activated service worker.
        lazyReload();
      }
    });
  }

  if (registration.installing) {
    listenInstalledStateChange();
    return;
  }

  // We are currently controlled so a new SW may be found...
  // Add a listener in case a new SW is found,
  registration.addEventListener('updatefound', listenInstalledStateChange);
}

async function registerServiceWorker() {
  if (
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production' &&
    window.location.host.indexOf('mui.com') !== -1
  ) {
    // register() automatically attempts to refresh the sw.js.
    const registration = await navigator.serviceWorker.register('/toolpad/sw.js');
    // Force the page reload for users.
    forcePageReload(registration);
  }
}

let dependenciesLoaded = false;

function loadDependencies() {
  if (dependenciesLoaded) {
    return;
  }

  dependenciesLoaded = true;

  loadCSS(
    'https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Two+Tone',
    document.querySelector('#material-icon-font'),
  );
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.log(
    `%c

███╗   ███╗ ██╗   ██╗ ██████╗
████╗ ████║ ██║   ██║   ██╔═╝
██╔████╔██║ ██║   ██║   ██║
██║╚██╔╝██║ ██║   ██║   ██║
██║ ╚═╝ ██║ ╚██████╔╝ ██████╗
╚═╝     ╚═╝  ╚═════╝  ╚═════╝

`,
    'font-family:monospace;color:#1976d2;font-size:12px;',
  );
}

function AppWrapper(props) {
  const { children, emotionCache, pageProps } = props;

  const router = useRouter();
  const { productId, productCategoryId } = getProductInfoFromUrl(router.asPath);

  React.useEffect(() => {
    loadDependencies();
    registerServiceWorker();

    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  let fonts = [];
  if (pathnameToLanguage(router.asPath).canonicalAs.match(/onepirate/)) {
    fonts = [
      'https://fonts.googleapis.com/css?family=Roboto+Condensed:700|Work+Sans:300,400&display=swap',
    ];
  }

  const pageContextValue = React.useMemo(() => {
    let productIdentifier;
    let pages = [];

    /*
     * Backwards compatibility with older versions of getProductInfoFromUrl
     * which returned
     *  {
     *    productCategoryId: 'null',
     *    productId: 'toolpad',
     *  }
     * for all Toolpad pages.
     * ̃ Note:
     *    `productCategoryId` is the string 'null' and not null.
     *    See: https://github.com/mui/material-ui/blob/master/docs/src/modules/utils/getProductInfoFromUrl.ts#L29
     */

    if (productCategoryId === 'null') {
      const secondFolder = pathnameToLanguage(router.asPath)?.canonicalAsServer?.replace(
        /^\/+[^/]+\/([^/]+)\/.*/,
        '$1',
      );
      if (secondFolder === 'studio') {
        productIdentifier = {
          metadata: '',
          name: 'Toolpad Studio',
          versions: [{ text: `v${toolpadPkgJson.version}`, current: true }],
        };
        pages = toolpadStudioPages;
      } else {
        productIdentifier = {
          metadata: '',
          name: 'Toolpad Core',
          versions: [{ text: `v0.0.1`, current: true }],
        };
        pages = toolpadCorePages;
      }
    } else if (productCategoryId === 'toolpad') {
      if (productId === 'toolpad-core') {
        productIdentifier = {
          metadata: '',
          name: 'Toolpad Core',
          versions: [{ text: `v0.0.1`, current: true }],
        };
        pages = toolpadCorePages;
      } else if (productId === 'toolpad-studio') {
        productIdentifier = {
          metadata: '',
          name: 'Toolpad Studio',
          versions: [{ text: `v${toolpadPkgJson.version}`, current: true }],
        };
        pages = toolpadStudioPages;
      }
    }

    const { activePage, activePageParents } = findActivePage(pages, router.pathname);

    return {
      activePage,
      activePageParents,
      pages,
      productIdentifier,
      productId,
      productCategoryId,
    };
  }, [router.asPath, router.pathname, productId, productCategoryId]);

  return (
    <React.Fragment>
      <NextHead>
        {fonts.map((font) => (
          <link rel="stylesheet" href={font} key={font} />
        ))}
        <meta name="mui:productId" content={productId} />
        <meta name="mui:productCategoryId" content={productCategoryId} />
      </NextHead>
      <DocsProvider
        config={config}
        defaultUserLanguage={pageProps.userLanguage}
        translations={pageProps.translations}
      >
        <CodeCopyProvider>
          <CodeVariantProvider>
            <PageContext.Provider value={pageContextValue}>
              <ThemeProvider>
                <DocsStyledEngineProvider cacheLtr={emotionCache}>
                  {children}
                  <GoogleAnalytics />
                </DocsStyledEngineProvider>
              </ThemeProvider>
            </PageContext.Provider>
          </CodeVariantProvider>
        </CodeCopyProvider>
      </DocsProvider>
    </React.Fragment>
  );
}

AppWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  emotionCache: PropTypes.object.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default function MyApp(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <AppWrapper emotionCache={emotionCache} pageProps={pageProps}>
      <Component {...pageProps} />
    </AppWrapper>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};

MyApp.getInitialProps = async ({ ctx, Component }) => {
  let pageProps = {};

  const req = require.context('../translations', false, /translations.*\.json$/);
  const translations = mapTranslations(req);

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  return {
    pageProps: {
      userLanguage: ctx.query.userLanguage || 'en',
      translations,
      ...pageProps,
    },
  };
};

// Track fraction of actual events to prevent exceeding event quota.
// Filter sessions instead of individual events so that we can track multiple metrics per device.
const disableWebVitalsReporting = Math.random() > 0.0001;
export function reportWebVitals({ id, name, label, delta, value }) {
  if (disableWebVitalsReporting) {
    return;
  }

  window.gtag('event', name, {
    value: delta,
    metric_label: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
    metric_value: value,
    metric_delta: delta,
    metric_id: id, // id unique to current page load
  });
}
