/** @type {import('./src/config').SharedConfig} */
const sharedConfig = {};

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  publicRuntimeConfig: sharedConfig,

  webpack: (config, { isServer }) => {
    if (isServer) {
      // See https://github.com/prisma/prisma/issues/6564#issuecomment-853028373
      config.externals.push('_http_common');
    }
    return config;
  },

  async rewrites() {
    return [
      {
        source: '/deploy/:appId',
        destination: '/deploy/:appId',
      },
      {
        source: '/deploy/:appId/:path*',
        destination: '/api/deploy/:appId/:path*',
      },
      {
        source: '/release/:appId/:path*',
        destination: '/api/release/:appId/:path*',
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/_next/static/chunks/:path*',
        headers: [
          {
            key: 'service-worker-allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};
