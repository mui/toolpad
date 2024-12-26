// Common files for all apps
import theme from './templates/theme';
import eslintConfig from './templates/eslintConfig';
import nextConfig from './templates/nextConfig';
import nextTypes from './templates/nextTypes';
import tsConfig from './templates/tsConfig';
import readme from './templates/readme';
import gitignore from './templates/gitignore';
import ordersPage from './templates/ordersPage';
import packageJson from './templates/packageJson';
import indexPage from './templates/indexPage';

// App Router specific files
import rootLayout from './templates/nextjs-app/rootLayout';
import dashboardLayout from './templates/nextjs-app/dashboardLayout';

// Pages router specific files
import app from './templates/nextjs-pages/app';
import document from './templates/nextjs-pages/document';

// Auth specific files for all apps
import auth from './templates/auth/auth';
import envLocal from './templates/auth/envLocal';
import middleware from './templates/auth/middleware';
import routeHandler from './templates/auth/route';
import prisma from './templates/auth/prisma';
import env from './templates/auth/env';
import schemaPrisma from './templates/auth/schemaPrisma';

// Auth files for App Router
import signInPage from './templates/auth/nextjs-app/signInPage';
import signInAction from './templates/auth/nextjs-app/actions';

// Auth files for Pages Router
import signInPagePagesRouter from './templates/auth/nextjs-pages/signIn';

import { GenerateProjectOptions } from './types';

export default function generateProject(
  options: GenerateProjectOptions,
): Map<string, { content: string }> {
  // Add app name to package.json

  // Default files, common to all apps
  const files = new Map<string, { content: string }>([
    ['theme.ts', { content: theme }],
    ['next-env.d.ts', { content: nextTypes }],
    ['next.config.mjs', { content: nextConfig(options) }],
    ['.eslintrc.json', { content: eslintConfig }],
    ['tsconfig.json', { content: tsConfig }],
    ['README.md', { content: readme }],
    ['.gitignore', { content: gitignore }],
    [
      'package.json',
      {
        content: JSON.stringify(packageJson(options)),
      },
    ],
  ]);
  const indexPageContent = indexPage(options);

  switch (options.router) {
    case 'nextjs-pages': {
      const nextJsPagesRouterStarter = new Map([
        ['pages/index.tsx', { content: indexPageContent }],
        ['pages/orders/index.tsx', { content: ordersPage(options) }],
        ['pages/_document.tsx', { content: document }],
        ['pages/_app.tsx', { content: app(options) }],
      ]);
      if (options.auth) {
        const authFiles = new Map([
          ['auth.ts', { content: auth(options) }],
          ['.env.local', { content: envLocal(options) }],
          ['middleware.ts', { content: middleware }],
          // next-auth v5 does not provide an API route, so this file must be in the App Router
          // even if the rest of the app is using pages router
          // https://authjs.dev/getting-started/installation#configure
          ['app/api/auth/[...nextAuth]/route.ts', { content: routeHandler }],
          ['pages/auth/signin.tsx', { content: signInPagePagesRouter(options) }],
        ]);
        if (options.hasNodemailerProvider || options.hasPasskeyProvider) {
          // Prisma adapter support requires removal of middleware
          authFiles.delete('middleware.ts');
          const prismaFiles = new Map([
            ['prisma.ts', { content: prisma }],
            ['.env', { content: env }],
            ['prisma/schema.prisma', { content: schemaPrisma(options) }],
          ]);
          return new Map([...files, ...nextJsPagesRouterStarter, ...authFiles, ...prismaFiles]);
        }
        return new Map([...files, ...nextJsPagesRouterStarter, ...authFiles]);
      }
      return new Map([...files, ...nextJsPagesRouterStarter]);
    }
    case 'nextjs-app':
    default: {
      const nextJsAppRouterStarter = new Map([
        ['app/(dashboard)/layout.tsx', { content: dashboardLayout }],
        ['app/layout.tsx', { content: rootLayout(options) }],
        ['app/(dashboard)/page.tsx', { content: indexPageContent }],
        ['app/(dashboard)/orders/page.tsx', { content: ordersPage(options) }],
      ]);
      if (options.auth) {
        const authFiles = new Map([
          ['auth.ts', { content: auth(options) }],
          ['.env.local', { content: envLocal(options) }],
          ['middleware.ts', { content: middleware }],
          ['app/api/auth/[...nextAuth]/route.ts', { content: routeHandler }],
          ['app/auth/signin/page.tsx', { content: signInPage(options) }],
          ['app/auth/signin/actions.ts', { content: signInAction(options) }],
        ]);
        if (options.hasNodemailerProvider || options.hasPasskeyProvider) {
          // Prisma adapater support requires removal of middleware
          authFiles.delete('middleware.ts');
          const prismaFiles = new Map([
            ['prisma.ts', { content: prisma }],
            ['.env', { content: env }],
            ['prisma/schema.prisma', { content: schemaPrisma(options) }],
          ]);
          return new Map([...files, ...nextJsAppRouterStarter, ...authFiles, ...prismaFiles]);
        }

        return new Map([...files, ...nextJsAppRouterStarter, ...authFiles]);
      }
      return new Map([...files, ...nextJsAppRouterStarter]);
    }
  }
}
