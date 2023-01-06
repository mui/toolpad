import { RUNTIME_CONFIG_WINDOW_PROPERTY } from './constants';

/**
 * There are three ways of configuring toolpad:
 *
 * 1. Build time:
 *    These can be used both serverside and browserside.
 *    They are inlined at build time. Use when you know the values at build time.
 *    They can be used to tree-shake code at build time
 *      - Configure in next.config.js `env` option
 *      - Use as process.env.MY_VARIABLE
 *
 * 2. Runtime, public:
 *    These can be used both on the server and in the browser
 *      - Configure in this file in the default export
 *      - Use by importing this module (`./src/config`)
 *
 * 3. Runtime, private:
 *    These can be used both on the server only, they are suitable for secrets
 *      - Configure in the file `./src/server.config`
 *      - Use by importing the module `./src/server.config`
 */

// These are inlined at build time
export type BuildEnvVars = Record<
  // Identifier for the product line (CE, EE, Cloud, ...)
  | 'TOOLPAD_TARGET'
  // The current Toolpad version
  | 'TOOLPAD_VERSION'
  // The current Toolpad build number
  | 'TOOLPAD_BUILD',
  string
>;

// These are set at runtime and passed to the browser.
// Do not add secrets
export interface RuntimeConfig {
  // Enable input field for seeding a dom in the app creation dialog
  // (For testing purposes)
  enableCreateByDom?: boolean;
  // Enable demo mode
  isDemo: boolean;
  // Google Analytics measurement ID
  gaId?: string;
  // Sentry DSN
  sentryDsn?: string;
  // Google reCAPTCHA site keys
  recaptchaV2SiteKey?: string;
  recaptchaV3SiteKey?: string;
  externalUrl: string;
  localMode: boolean;
  projectDir?: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends BuildEnvVars {}
  }
}

declare global {
  interface Window {
    [RUNTIME_CONFIG_WINDOW_PROPERTY]?: RuntimeConfig;
  }
}

function getBrowsersideRuntimeConfig(): RuntimeConfig {
  // These are being initialized in ./pages/_document.tsx
  const maybeRuntimeConfig = window[RUNTIME_CONFIG_WINDOW_PROPERTY];
  if (!maybeRuntimeConfig) {
    throw new Error(`Unable to access the runtime config in the browser`);
  }
  return maybeRuntimeConfig;
}

const runtimeConfig: RuntimeConfig =
  typeof window === 'undefined'
    ? {
        // Define runtime config here
        enableCreateByDom: !!process.env.TOOLPAD_ENABLE_CREATE_BY_DOM,
        isDemo: !!process.env.TOOLPAD_DEMO,
        gaId: process.env.TOOLPAD_GA_ID,
        sentryDsn: process.env.TOOLPAD_SENTRY_DSN,
        recaptchaV2SiteKey: process.env.TOOLPAD_RECAPTCHA_V2_SITE_KEY,
        recaptchaV3SiteKey: process.env.TOOLPAD_RECAPTCHA_V3_SITE_KEY,
        externalUrl:
          process.env.TOOLPAD_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`,
        localMode: !!process.env.TOOLPAD_LOCAL_MODE,
        projectDir: process.env.TOOLPAD_PROJECT_DIR,
      }
    : getBrowsersideRuntimeConfig();

export default runtimeConfig;
