import { createRequire } from 'module';
import * as path from 'path';

const require = createRequire(import.meta.url);

/**
 * @param {string} input
 */
function isValidTarget(input) {
  return input === 'CLOUD' || input === 'CE' || input === 'PRO';
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
    TOOLPAD_DEMO: env.TOOLPAD_DEMO,
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

export default /** @type {import('next').NextConfig} */({
  reactStrictMode: true,

  eslint: {
    // We're running this as part of the monorepo eslint
    ignoreDuringBuilds: true,
  },

  // build-time env vars
  env: parseBuidEnvVars(process.env),

  webpack: (config, options) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      // We need these because quickjs-emscripten doesn't export pure browser compatible modules yet
      // https://github.com/justjake/quickjs-emscripten/issues/33
      fs: false,
      path: false,
    };

    {
      // Adapted from next-transpile-modules.
      // Extracts the css imports in monaco-editor.
      // next-transpile-modules also compiles javascript and results in buggy output.
      const extraCssIssuer = /\/node_modules\/monaco-editor\//;
      const modulesPaths = [path.dirname(require.resolve('monaco-editor/package.json'))];

      // Support CSS modules + global in node_modules
      // TODO ask Next.js maintainer to expose the css-loader via defaultLoaders
      const nextCssLoaders = config.module.rules.find((rule) => typeof rule.oneOf === 'object');

      // Add support for Global CSS imports in transpiled modules
      if (nextCssLoaders) {
        const nextGlobalCssLoader = nextCssLoaders.oneOf.find(
          (rule) => rule.sideEffects === true && regexEqual(rule.test, /(?<!\.module)\.css$/),
        );

        if (nextGlobalCssLoader) {
          nextGlobalCssLoader.issuer = { or: [extraCssIssuer, nextGlobalCssLoader.issuer] };
          nextGlobalCssLoader.include = { or: [...modulesPaths, nextGlobalCssLoader.include] };
        } else if (!options.isServer) {
          // Note that Next.js ignores global CSS imports on the server
          console.warn('could not find default CSS rule, global CSS imports may not work');
        }
      }
    }

    return config;
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
});
