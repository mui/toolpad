const path = require('path');

const withTM = require('next-transpile-modules')(['@mui/monorepo'], {
  __unstable_matcher: (matchedPath) => {
    return /(@mui[\\/]monorepo)[\\/](?!.*node_modules)/.test(matchedPath);
  },
});

const pkg = require('../package.json');
const { findPages } = require('./src/modules/utils/find');
const { LANGUAGES, LANGUAGES_SSR } = require('./src/modules/constants');

const MONORPO_PATH = path.resolve(__dirname, './node_modules/@mui/monorepo');
const MONOREPO_PACKAGES = {
  '@mui/docs': path.resolve(MONORPO_PATH, './packages/mui-docs/src'),
  '@mui/joy': path.resolve(MONORPO_PATH, './packages/mui-joy/src'),
  '@mui/styled-engine': path.resolve(MONORPO_PATH, './packages/mui-styled-engine/src'),
  '@mui/system': path.resolve(MONORPO_PATH, './packages/mui-system/src'),
  '@mui/base': path.resolve(MONORPO_PATH, './packages/mui-base/src'),
  '@mui/markdown': path.resolve(MONORPO_PATH, './docs/packages/markdown'),
  '@mui/material': path.resolve(MONORPO_PATH, './packages/mui-material/src'),
  '@mui/icons-material': path.resolve(MONORPO_PATH, './packages/mui-icons-material/lib'),
  '@mui/styles': path.resolve(MONORPO_PATH, './packages/mui-styles'),
  '@mui/utils': path.resolve(MONORPO_PATH, './packages/mui-utils'),
  '@mui/private-theming': path.resolve(MONORPO_PATH, './packages/mui-private-theming/src'),
};

/**
 * https://github.com/zeit/next.js/blob/287961ed9142a53f8e9a23bafb2f31257339ea98/packages/next/next-server/server/config.ts#L10
 * @typedef {'legacy' | 'blocking' | 'concurrent'} ReactRenderMode
 * legacy - ReactDOM.render(<App />)
 * legacy-strict - ReactDOM.render(<React.StrictMode><App /></React.StrictMode>, Element)
 * blocking - ReactDOM.createSyncRoot(Element).render(<App />)
 * concurrent - ReactDOM.createRoot(Element).render(<App />)
 * @type {ReactRenderMode | 'legacy-strict'}
 */
const reactStrictMode = true;
if (reactStrictMode) {
  // eslint-disable-next-line no-console
  console.log(`Using React.StrictMode.`);
}

module.exports = withTM({
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Motivated by https://github.com/zeit/next.js/issues/7687
    ignoreDevErrors: true,
    ignoreBuildErrors: true,
  },
  env: {
    COMMIT_REF: process.env.COMMIT_REF,
    CONTEXT: process.env.CONTEXT,
    ENABLE_AD: process.env.ENABLE_AD,
    GITHUB_AUTH: process.env.GITHUB_AUTH,
    LIB_VERSION: pkg.version,
    PULL_REQUEST: process.env.PULL_REQUEST === 'true',
    REACT_STRICT_MODE: reactStrictMode,
    FEEDBACK_URL: process.env.FEEDBACK_URL,
    // Set by Netlify
    GRID_EXPERIMENTAL_ENABLED: process.env.PULL_REQUEST === 'false' ? 'false' : 'true',
    // #default-branch-switch
    SOURCE_CODE_ROOT_URL: 'https://github.com/mui/mui-x/blob/master',
    SOURCE_CODE_REPO: 'https://github.com/mui/mui-x',
  },
  webpack5: true,
  webpack: (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          docs: path.resolve(MONORPO_PATH, './docs'),
          [path.resolve(MONORPO_PATH, './packages/mui-utils/macros/MuiError.macro')]: 'react',
          ...MONOREPO_PACKAGES,
        },
      },
      module: {
        ...config.module,
        rules: config.module.rules.concat([
          // used in some /getting-started/templates
          {
            test: /\.md$/,
            oneOf: [
              {
                resourceQuery: /@mui\/markdown/,
                use: require.resolve('@mui/monorepo/docs/packages/markdown/loader'),
              },
            ],
          },
        ]),
      },
    };
  },
  trailingSlash: true,
  // Next.js provides a `defaultPathMap` argument, we could simplify the logic.
  // However, we don't in order to prevent any regression in the `findPages()` method.
  exportPathMap: () => {
    const pages = findPages();
    const map = {};

    function traverse(pages2, userLanguage) {
      const prefix = userLanguage === 'en' ? '' : `/${userLanguage}`;

      pages2.forEach((page) => {
        if (!page.children) {
          map[`${prefix}${page.pathname.replace(/^\/api-docs\/(.*)/, '/api/$1')}`] = {
            page: page.pathname,
            query: {
              userLanguage,
            },
          };
          return;
        }

        traverse(page.children, userLanguage);
      });
    }

    // We want to speed-up the build of pull requests.
    if (process.env.PULL_REQUEST === 'true') {
      // eslint-disable-next-line no-console
      console.log('Considering only English for SSR');
      traverse(pages, 'en');
    } else {
      // eslint-disable-next-line no-console
      console.log('Considering various locales for SSR');
      LANGUAGES_SSR.forEach((userLanguage) => {
        traverse(pages, userLanguage);
      });
    }

    return map;
  },
  reactStrictMode,
  async rewrites() {
    return [
      { source: `/:lang(${LANGUAGES.join('|')})?/:rest*`, destination: '/:rest*' },
      { source: '/api/:rest*', destination: '/api-docs/:rest*' },
    ];
  },
  // redirects only take effect in the development, not production (because of `next export`).
  redirects: async () => [
    {
      source: '/',
      destination: '/toolpad',
      permanent: false,
    },
  ],
});
