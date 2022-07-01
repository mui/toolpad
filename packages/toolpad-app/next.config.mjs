import { createRequire } from 'module';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import * as path from 'path';

const require = createRequire(import.meta.url);

/** @type {import('./src/config').BuildEnvVars} */
const buildEnvVars = {
  TOOLPAD_TARGET: process.env.TOOLPAD_TARGET || 'CE',
};

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

/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,

  eslint: {
    // We're running this as part of the monorepo eslint
    ignoreDuringBuilds: true,
  },

  // build-time env vars
  env: buildEnvVars,

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
          console.warn(
            'next-transpile-modules - could not find default CSS rule, global CSS imports may not work',
          );
        }
      }
    }

    config.plugins = [
      ...config.plugins,
      new MonacoWebpackPlugin({
        languages: ['typescript', 'json', 'css', 'html'],
        filename: 'static/[name].worker.js',
      }),
    ];

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
};
