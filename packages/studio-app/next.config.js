/** @type {import('./src/config').SharedConfig} */
const sharedConfig = {};

console.log(`APP uid ${process.getuid()}  euid ${process.geteuid()}`);

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
