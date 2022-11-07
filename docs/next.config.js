const path = require('path');
const withDocsInfra = require('@mui/monorepo/docs/nextConfigDocsInfra');

const withTM = require('next-transpile-modules')(['@mui/monorepo'], {
  __unstable_matcher: (matchedPath) => {
    return /(@mui[\\/]monorepo)[\\/](?!.*node_modules)/.test(matchedPath);
  },
});

const pkg = require('../package.json');
const { findPages } = require('./src/modules/utils/find');

const MONORPO_PATH = path.resolve(__dirname, './node_modules/@mui/monorepo');
const MONOREPO_PACKAGES = {
  '@mui/base': path.resolve(MONORPO_PATH, './packages/mui-base/src'),
  '@mui/codemod': path.resolve(MONORPO_PATH, './packages/mui-codemod/src'),
  '@mui/docs': path.resolve(MONORPO_PATH, './packages/mui-docs/src'),
  '@mui/envinfo': path.resolve(MONORPO_PATH, './packages/mui-envinfo'),
  '@mui/icons-material': path.resolve(MONORPO_PATH, './packages/mui-icons-material/lib'),
  '@mui/joy': path.resolve(MONORPO_PATH, './packages/mui-joy/src'),
  '@mui/lab': path.resolve(MONORPO_PATH, './packages/mui-lab/src'),
  '@mui/material': path.resolve(MONORPO_PATH, './packages/mui-material/src'),
  '@mui/material-next': path.resolve(MONORPO_PATH, './packages/mui-material-next/src'),
  '@mui/private-theming': path.resolve(MONORPO_PATH, './packages/mui-private-theming/src'),
  '@mui/styled-engine': path.resolve(MONORPO_PATH, './packages/mui-styled-engine/src'),
  '@mui/styled-engine-sc': path.resolve(MONORPO_PATH, './packages/mui-styled-engine-sc/src'),
  '@mui/styles': path.resolve(MONORPO_PATH, './packages/mui-styles'),
  '@mui/system': path.resolve(MONORPO_PATH, './packages/mui-system/src'),
  '@mui/types': path.resolve(MONORPO_PATH, './packages/mui-types'),
  '@mui/markdown': path.resolve(MONORPO_PATH, './docs/packages/markdown'),
  '@mui/utils': path.resolve(MONORPO_PATH, './packages/mui-utils'),
};

module.exports = withTM(
  withDocsInfra({
    experimental: {
      esmExternals: false,
    },
    // Avoid conflicts with the other Next.js apps hosted under https://mui.com/
    assetPrefix: process.env.DEPLOY_ENV === 'development' ? '' : '/toolpad',
    env: {
      LIB_VERSION: pkg.version,
      // #default-branch-switch
      SOURCE_CODE_ROOT_URL: 'https://github.com/mui/mui-toolpad/blob/master',
      SOURCE_CODE_REPO: 'https://github.com/mui/mui-toolpad',
    },
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

      // eslint-disable-next-line no-console
      console.log('Considering only English for SSR');
      traverse(pages, 'en');

      return map;
    },
    rewrites: async () => {
      return [{ source: '/api/:rest*', destination: '/api-docs/:rest*' }];
    },
    // redirects only take effect in the development, not production (because of `next export`).
    redirects: async () => [
      {
        source: '/',
        destination: '/toolpad/',
        permanent: false,
      },
    ],
  }),
);
