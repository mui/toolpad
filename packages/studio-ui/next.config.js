/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/sandbox/serviceWorker/index.js',
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
