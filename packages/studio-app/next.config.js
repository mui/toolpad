/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    DEMO_MODE: process.env.DEMO_MODE,
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
