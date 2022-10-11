import { createRequire } from 'module';
import * as path from 'path';
import { withSentryConfig } from '@sentry/nextjs';

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
    TOOLPAD_DEMO: env.TOOLPAD_DEMO || '',
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
    value: 'SAMEORIGIN',
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

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs

  dryRun: !process.env.TOOLPAD_SENTRY_DSN,
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

const NEVER = () => false;

export default /** @type {import('next').NextConfig} */ withSentryConfig(
  {
    reactStrictMode: true,
    poweredByHeader: false,
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

      {
        // Support global CSS in monaco-editor
        // Adapted from next-transpile-modules.
        const extraCssIssuer = /(\/|\\)node_modules(\/|\\)monaco-editor(\/|\\)/;
        const modulesPaths = [path.dirname(require.resolve('monaco-editor/package.json'))];

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
      // Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
      // for client-side builds. (This will be the default starting in
      // `@sentry/nextjs` version 8.0.0.) See
      // https://webpack.js.org/configuration/devtool/ and
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
      // for more information.
      hideSourceMaps: true,
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
          source: '/:path*',
          headers: securityHeaders,
        },
      ];
    },
  },
  sentryWebpackPluginOptions,
);
