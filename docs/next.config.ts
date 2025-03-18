// @ts-check
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { createRequire } from 'module';
import { LANGUAGES, LANGUAGES_IGNORE_PAGES, LANGUAGES_IN_PROGRESS } from './config';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

const require = createRequire(import.meta.url);

const withDocsInfra = require('@mui/monorepo/docs/nextConfigDocsInfra');

const { findPages } = require('./src/modules/utils/find');

const WORKSPACE_ROOT = path.resolve(currentDirectory, '../');
const MONOREPO_PATH = path.resolve(currentDirectory, '../node_modules/@mui/monorepo');
const MONOREPO_PACKAGES = {
  '@mui/docs': path.resolve(MONOREPO_PATH, './packages/mui-docs/src'),
};

function loadPkg(pkgPath: string): { version: string } {
  const pkgContent = fs.readFileSync(path.resolve(WORKSPACE_ROOT, pkgPath, 'package.json'), 'utf8');
  return JSON.parse(pkgContent);
}

const toolpadCorePkg = loadPkg('./packages/toolpad-core');
const toolpadStudioPkg = loadPkg('./packages/toolpad-studio');

export default withDocsInfra({
  transpilePackages: [
    // TODO, those shouldn't be needed in the first place
    '@mui/monorepo', // Migrate everything to @mui/docs until the @mui/monorepo dependency becomes obsolete
    '@mui/x-charts', // Fix ESM module support https://github.com/mui/mui-x/issues/9826#issuecomment-1658333978
    // Fix trailingSlash support https://github.com/mui/toolpad/pull/3301#issuecomment-2054213837
    // Migrate everything from @mui/monorepo to @mui/docs
    '@mui/docs',
    '@toolpad/studio-runtime',
    '@toolpad/studio-components',
  ],
  // Avoid conflicts with the other Next.js apps hosted under https://mui.com/
  assetPrefix: process.env.DEPLOY_ENV === 'development' ? undefined : '/toolpad',
  env: {
    // docs-infra
    LIB_VERSION: toolpadCorePkg.version,
    SOURCE_CODE_REPO: 'https://github.com/mui/toolpad',
    SOURCE_GITHUB_BRANCH: 'master', // #default-branch-switch
    GITHUB_TEMPLATE_DOCS_FEEDBACK: '4.docs-feedback.yml',
    // Toolpad related
    // …
    TOOLPAD_CORE_VERSION: toolpadCorePkg.version,
    TOOLPAD_STUDIO_VERSION: toolpadStudioPkg.version,
  },
  webpack: (config, options) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          docs: path.resolve(MONOREPO_PATH, './docs'),
          'docs-toolpad': path.resolve(WORKSPACE_ROOT, './docs'),
          ...MONOREPO_PACKAGES,
          '@toolpad/utils': path.resolve(WORKSPACE_ROOT, './packages/toolpad-utils/src'),
          '@toolpad/core': path.resolve(WORKSPACE_ROOT, './packages/toolpad-core/src'),
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
