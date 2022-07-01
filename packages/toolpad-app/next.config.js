const withTM = require('next-transpile-modules')(['monaco-editor']);
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

/** @type {import('./src/config').BuildEnvVars} */
const buildEnvVars = {
  TOOLPAD_TARGET: process.env.TOOLPAD_TARGET || 'CE',
};

/** @type {import('next').NextConfig} */
module.exports = withTM({
  reactStrictMode: true,

  eslint: {
    // We're running this as part of the monorepo eslint
    ignoreDuringBuilds: true,
  },

  // build-time env vars
  env: buildEnvVars,

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      // We need these because quickjs-emscripten doesn't export pure browser compatible modules yet
      // https://github.com/justjake/quickjs-emscripten/issues/33
      fs: false,
      path: false,
    };

    config.plugins = [
      ...config.plugins,
      new MonacoWebpackPlugin({
        languages: ['typescript', 'javascript', 'json'],
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
});
