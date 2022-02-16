/** @type {import('./src/config').SharedConfig} */
const sharedConfig = {
  demoMode: process.env.DEMO_MODE === 'true',
};

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  publicRuntimeConfig: sharedConfig,
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
