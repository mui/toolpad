import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const withDocsInfra = require('@mui/monorepo-docs/nextConfigDocsInfra');

const pkg = require('../package.json');
const { findPages } = require('./src/modules/utils/find');

export default withDocsInfra(
  /** @type {import('next').NextConfig  }} */ ({
    transpilePackages: ['@mui/monorepo-docs'],
    // Avoid conflicts with the other Next.js apps hosted under https://mui.com/
    assetPrefix: process.env.DEPLOY_ENV === 'development' ? undefined : '/toolpad',
    env: {
      LIB_VERSION: pkg.version,
      // #default-branch-switch
      // SOURCE_CODE_ROOT_URL: 'https://github.com/mui/mui-toolpad/blob/master',
      SOURCE_CODE_REPO: 'https://github.com/mui/mui-toolpad',
      SOURCE_GITHUB_BRANCH: 'master',
    },
    webpack: (config, options) => {
      return {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...config.resolve.alias,
            docs: '@mui/monorepo-docs',
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
                  use: [
                    options.defaultLoaders.babel,
                    {
                      loader: require.resolve('@mui/markdown/loader'),
                      options: {
                        env: {
                          SOURCE_CODE_REPO: options.config.env.SOURCE_CODE_REPO,
                          LIB_VERSION: options.config.env.LIB_VERSION,
                        },
                      },
                    },
                  ],
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
