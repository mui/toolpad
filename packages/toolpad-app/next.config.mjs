/**
 * @param {string} input
 * @returns {input is import('./src/config').ToolpadTargetType}
 */
function isValidTarget(input) {
  return input === 'CLOUD' || input === 'CE' || input === 'PRO';
}

/** @type {(env: Partial<Record<string, string>>) => import('./src/config').BuildEnvVars} */
function parseBuidEnvVars(env) {
  /** @type {import('./src/config').ToolpadTargetType} */
  let target = 'CE';
  if (env.TOOLPAD_TARGET && !isValidTarget(env.TOOLPAD_TARGET)) {
    if (isValidTarget(env.TOOLPAD_TARGET)) {
      target = env.TOOLPAD_TARGET;
    } else {
      throw new Error(`Invalid "TOOLPAD_TARGET", got ${env.TOOLPAD_TARGET}`);
    }
  }

  return {
    TOOLPAD_TARGET: target,
    TOOLPAD_DEMO: env.TOOLPAD_DEMO === 'true',
  };
}

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,

  eslint: {
    // We're running this as part of the monorepo eslint
    ignoreDuringBuilds: true,
  },

  // build-time env vars
  env: parseBuidEnvVars(process.env),

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

  async rewrites() {
    return [
      {
        source: '/health-check',
        destination: '/api/health-check',
      },
    ];
  },
};
