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

    config.resolve.fallback = {
      ...config.resolve.fallback,
      // We need these because quickjs-emscripten doesn't export pure browser compatible modules yet
      // https://github.com/justjake/quickjs-emscripten/issues/33
      fs: false,
      path: false,
    };

    return config;
  },

  async rewrites() {
    return [
      {
        source: '/deploy/:appId/:path*',
        destination: '/api/deploy/:appId/:path*',
      },
      {
        source: '/app/:appId/:path*',
        destination: '/api/app/:appId/:path*',
      },
    ];
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
