import { createRequire } from 'module';
import createBundleAnalyzer from '@next/bundle-analyzer';

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
function parseBuildEnvVars(env) {
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

export default withBundleAnalyzer({
  transpilePackages: ['monaco-editor'],
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // We're running this as part of the monorepo eslint
    ignoreDuringBuilds: true,
  },
  // build-time env vars
  env: parseBuildEnvVars(process.env),
  /**
   * @param {import('webpack').Configuration} config
   */
  webpack: (config) => {
    config.module ??= {};
    config.module.parser ??= {};
    config.module.parser.javascript ??= {};
    config.module.parser.javascript.exportsPresence = 'error';
    return config;
  },
});
