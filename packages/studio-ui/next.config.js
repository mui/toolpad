/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
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
