// @ts-check
import * as path from 'path';
import * as url from 'url';
import { createRequire } from 'module';
import { LANGUAGES, LANGUAGES_IGNORE_PAGES, LANGUAGES_IN_PROGRESS } from './config.js';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

const require = createRequire(import.meta.url);

const withDocsInfra = require('@mui/monorepo/docs/nextConfigDocsInfra');

const pkg = require('../package.json');
const { findPages } = require('./src/modules/utils/find');

const WORKSPACE_ROOT = path.resolve(currentDirectory, '../');
const MONOREPO_PATH = path.resolve(currentDirectory, '../node_modules/@mui/monorepo');
const MONOREPO_PACKAGES = {
  '@mui/docs': path.resolve(MONOREPO_PATH, './packages/mui-docs/src'),
};

export default withDocsInfra({
  transpilePackages: [
    // TODO, those shouldn't be needed in the first place
    '@mui/monorepo', // Migrate everything to @mui/docs until the @mui/monorepo dependency becomes obsolete
    '@mui/x-charts', // Fix ESM module support https://github.com/mui/mui-x/issues/9826#issuecomment-1658333978
    // Fix trailingSlash support https://github.com/mui/mui-toolpad/pull/3301#issuecomment-2054213837
    // Migrate everything from @mui/monorepo to @mui/docs
    '@mui/docs',
  ],
  // Avoid conflicts with the other Next.js apps hosted under https://mui.com/
  assetPrefix: process.env.DEPLOY_ENV === 'development' ? undefined : '/toolpad',
  env: {
    // docs-infra
    LIB_VERSION: pkg.version,
    SOURCE_CODE_REPO: 'https://github.com/mui/mui-toolpad',
    SOURCE_GITHUB_BRANCH: 'master', // #default-branch-switch
    GITHUB_TEMPLATE_DOCS_FEEDBACK: '4.docs-feedback.yml',
    // Toolpad related
    // …
  },
  webpack: (config, options) => {
    return {
      ...config,
      // TODO, this shouldn't be needed in the first place
      // Migrate everything from @mui/monorepo to @mui/docs and embed @mui/internal-markdown in @mui/docs
      resolveLoader: {
        ...config.resolveLoader,
        alias: {
          ...config.resolveLoader.alias,
          '@mui/internal-markdown/loader': require.resolve(
            '@mui/monorepo/packages/markdown/loader',
          ),
        },
      },
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          docs: path.resolve(MONOREPO_PATH, './docs'),
          'docs-toolpad': path.resolve(WORKSPACE_ROOT, './docs'),
          ...MONOREPO_PACKAGES,
          '@toolpad/studio-components': path.resolve(
            currentDirectory,
            '../packages/toolpad-studio-components/src',
          ),
          '@toolpad/studio-runtime': path.resolve(
            currentDirectory,
            '../packages/toolpad-studio-runtime/src',
          ),
          '@toolpad/utils': path.resolve(currentDirectory, '../packages/toolpad-utils/src'),
          '@toolpad/core': path.resolve(currentDirectory, '../packages/toolpad-core/src'),
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
                resourceQuery: /muiMarkdown/,
                use: [
                  options.defaultLoaders.babel,
                  {
                    loader: '@mui/internal-markdown/loader',
                    options: {
                      workspaceRoot: WORKSPACE_ROOT,
                      ignoreLanguagePages: LANGUAGES_IGNORE_PAGES,
                      languagesInProgress: LANGUAGES_IN_PROGRESS,
                      packages: [
                        {
                          productId: 'toolpad-core',
                          paths: [path.join(WORKSPACE_ROOT, 'packages/toolpad-core/src')],
                        },
                      ],
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
          {
            test: /\.+(js|jsx|mjs|ts|tsx)$/,
            include: [/(@mui[\\/]monorepo)$/, /(@mui[\\/]monorepo)[\\/](?!.*node_modules)/],
            use: options.defaultLoaders.babel,
          },
        ]),
      },
    };
  },
  distDir: 'export',
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
  // Used to signal we run pnpm build
  ...(process.env.NODE_ENV === 'production'
    ? {
        output: 'export',
      }
    : {
        rewrites: async () => {
          return [
            { source: `/:lang(${LANGUAGES.join('|')})?/:rest*`, destination: '/:rest*' },
            { source: '/api/:rest*', destination: '/api-docs/:rest*' },
          ];
        },
        redirects: async () => [
          {
            source: '/',
            destination: '/toolpad/',
            permanent: false,
          },
        ],
      }),
});
