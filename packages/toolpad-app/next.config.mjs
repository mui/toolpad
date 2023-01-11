import { createRequire } from 'module';
import * as path from 'path';
import { withSentryConfig } from '@sentry/nextjs';
import createBundleAnalyzer from '@next/bundle-analyzer';

// Flag to be used to experiment with using transpilePackages to
// compile monaco-editor CSS
// Current blocker: https://github.com/vercel/next.js/issues/43125
const USE_EXPERIMENTAL_TRANSPILE_PACKAGES = false;

const withBundleAnalyzer = createBundleAnalyzer({ enabled: !!process.env.ANALYZE });

// TODO: remove when https://github.com/getsentry/sentry-javascript/issues/3852 gets resolved
process.env.SENTRY_IGNORE_API_RESOLUTION_ERROR = 'true';

const require = createRequire(import.meta.url);
const pkgJson = require('./package.json');

// Keep in sync with src/constants.ts. Convert to imports once next.config.ts is a feature
// See https://github.com/vercel/next.js/discussions/35969#discussioncomment-2523010
const TOOLPAD_TARGET_CE = 'CE';
const TOOLPAD_TARGET_CLOUD = 'CLOUD';
const TOOLPAD_TARGET_PRO = 'PRO';

/**
 * @param {string} input
 */
function isValidTarget(input) {
  return (
    input === TOOLPAD_TARGET_CLOUD || input === TOOLPAD_TARGET_CE || input === TOOLPAD_TARGET_PRO
  );
}

/** @type {(env: Partial<Record<string, string>>) => import('./src/config').BuildEnvVars} */
function parseBuidEnvVars(env) {
  let target = 'CE';
  if (env.TOOLPAD_TARGET && !isValidTarget(env.TOOLPAD_TARGET)) {
    if (isValidTarget(env.TOOLPAD_TARGET)) {
      target = env.TOOLPAD_TARGET;
    } else {
      throw new Error(`Invalid "TOOLPAD_TARGET", got ${env.TOOLPAD_TARGET}`);
    }
  }

  return {
    TOOLPAD_TARGET: target,
    TOOLPAD_VERSION: pkgJson.version,
    TOOLPAD_BUILD: env.GIT_SHA1?.slice(0, 7) || 'dev',
  };
}

/**
 * Check if two regexes are equal
 * Stolen from https://stackoverflow.com/questions/10776600/testing-for-equality-of-regular-expressions
 *
 * @param {RegExp} x
 * @param {RegExp} y
 * @returns {boolean}
 */
const regexEqual = (x, y) => {
  return (
    x instanceof RegExp &&
    y instanceof RegExp &&
    x.source === y.source &&
    x.global === y.global &&
    x.ignoreCase === y.ignoreCase &&
    x.multiline === y.multiline
  );
};

// See https://nextjs.org/docs/advanced-features/security-headers
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // Force the browser to trust the Content-Type header
    // https://stackoverflow.com/questions/18337630/what-is-x-content-type-options-nosniff
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

/** @type {Partial<import('@sentry/nextjs').SentryWebpackPluginOptions>} */
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs

  dryRun: true,
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

const NEVER = () => false;

export default withSentryConfig(
  withBundleAnalyzer(
    /** @type {import('next').NextConfig & { sentry: import('@sentry/nextjs/types/config/types').UserSentryOptions }} */ ({
      transpilePackages: USE_EXPERIMENTAL_TRANSPILE_PACKAGES ? ['monaco-editor'] : undefined,
      reactStrictMode: true,
      poweredByHeader: false,
      productionBrowserSourceMaps: true,
      eslint: {
        // We're running this as part of the monorepo eslint
        ignoreDuringBuilds: true,
      },
      // build-time env vars
      env: parseBuidEnvVars(process.env),
      /**
       * @param {import('webpack').Configuration} config
       */
      // @ts-ignore
      // Ignoring type mismatch because types from Sentry are incompatible
      // https://github.com/getsentry/sentry-javascript/issues/4560
      webpack: (config, options) => {
        config.resolve = config.resolve ?? {};
        config.resolve.fallback = {
          ...config.resolve.fallback,
          // We need these because quickjs-emscripten doesn't export pure browser compatible modules yet
          // https://github.com/justjake/quickjs-emscripten/issues/33
          fs: false,
          path: false,
        };

        if (!USE_EXPERIMENTAL_TRANSPILE_PACKAGES) {
          // Support global CSS in monaco-editor
          // Adapted from next-transpile-modules.
          const extraCssIssuer = /(\/|\\)node_modules(\/|\\)monaco-editor(\/|\\).*\.js$/;
          const modulesPaths = [
            path.resolve(path.dirname(require.resolve('monaco-editor/package.json')), './esm'),
          ];

          config.module = config.module ?? {};
          config.module.rules = config.module.rules ?? [];
          const nextCssLoaders = /** @type {import('webpack').RuleSetRule} */ (
            config.module.rules.find(
              (rule) => typeof rule === 'object' && typeof rule.oneOf === 'object',
            )
          );

          // Add support for Global CSS imports in transpiled modules
          if (nextCssLoaders) {
            const nextGlobalCssLoader = nextCssLoaders.oneOf?.find(
              (rule) =>
                rule.sideEffects === true &&
                rule.test instanceof RegExp &&
                regexEqual(rule.test, /(?<!\.module)\.css$/),
            );

            if (nextGlobalCssLoader) {
              nextGlobalCssLoader.issuer = {
                or: [extraCssIssuer, nextGlobalCssLoader.issuer ?? NEVER],
              };
              nextGlobalCssLoader.include = {
                or: [...modulesPaths, nextGlobalCssLoader.include ?? NEVER],
              };
            } else if (!options.isServer) {
              // Note that Next.js ignores global CSS imports on the server
              console.warn(
                'could not find default CSS rule, global CSS imports may not work correctly',
              );
            }
          }
        }

        return config;
      },
      sentry: {
        autoInstrumentServerFunctions: true,
        hideSourceMaps: false,
      },
      async redirects() {
        return [
          {
            source: '/release/:path*',
            destination: '/app/:path*',
            permanent: true,
          },
        ];
      },
      async rewrites() {
        return [
          {
            source: '/health-check',
            destination: '/api/health-check',
          },
        ];
      },
      headers: async () => {
        return [
          {
            source: '/((?!deploy/).*)',
            headers: securityHeaders,
          },
          {
            source: '/app-canvas/:path*',
            headers: [
              {
                key: 'X-Frame-Options',
                value: 'SAMEORIGIN',
              },
            ],
          },
        ];
      },
    }),
  ),
  sentryWebpackPluginOptions,
);
