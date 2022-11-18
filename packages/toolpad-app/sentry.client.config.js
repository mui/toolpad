// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import config from './src/config';

const SENTRY_DSN = config.sentryDsn;

Sentry.init({
  enabled: !!SENTRY_DSN,
  dsn: SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: process.env.NODE_ENV === 'development',
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
