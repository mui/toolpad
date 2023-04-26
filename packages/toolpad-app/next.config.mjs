import { createRequire } from 'module';
import * as path from 'path';
import createBundleAnalyzer from '@next/bundle-analyzer';

// Flag to be used to experiment with using transpilePackages to
// compile monaco-editor CSS
// Current blocker: https://github.com/vercel/next.js/issues/43125
const USE_EXPERIMENTAL_TRANSPILE_PACKAGES = false;

const withBundleAnalyzer = createBundleAnalyzer({ enabled: !!process.env.ANALYZE });

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

/** @type {(env: Partial<Record<string, string>>) => import('./src/config.js').BuildEnvVars} */
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

const NEVER = () => false;

export default withBundleAnalyzer({
  transpilePackages: USE_EXPERIMENTAL_TRANSPILE_PACKAGES ? ['monaco-editor'] : undefined,
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
  webpack: (config, options) => {
    config.module ??= {};
    config.module.strictExportPresence = true;

    if (!USE_EXPERIMENTAL_TRANSPILE_PACKAGES) {
      // Support global CSS in monaco-editor
      // Adapted from next-transpile-modules.
      const extraCssIssuer = /(\/|\\)node_modules(\/|\\)monaco-editor(\/|\\).*\.js$/;
      const modulesPaths = [
        path.resolve(path.dirname(require.resolve('monaco-editor/package.json')), './esm'),
      ];

      config.module.rules ??= [];
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
});
