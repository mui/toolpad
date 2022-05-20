/** @type {import('./src/config').BuildEnvVars} */
const buildEnvVars = {
  TOOLPAD_TARGET: process.env.TOOLPAD_TARGET || 'CE',
};

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,

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
};
