// Common files for all apps
import theme from './templates/theme';
import eslintConfig from './templates/eslintConfig';
import readme from './templates/readme';
import gitignore from './templates/gitignore';
import ordersPage from './templates/ordersPage';
import packageJson from './templates/packageJson';
import indexPage from './templates/indexPage';

// Vite specific files
import viteApp from './templates/vite/App';
import viteConfig from './templates/vite/viteConfig';
import viteMain from './templates/vite/main';
import viteHtml from './templates/vite/html';
import viteDashboardLayout from './templates/vite/dashboardLayout';
// Vite Auth specific files
import viteSessionContext from './templates/vite/SessionContext';
import viteSignIn from './templates/vite/auth/signin';
import viteEnv from './templates/vite/auth/env';
import viteFirebaseAuth from './templates/vite/auth/firebase';
import viteFirebaseConfig from './templates/vite/auth/firebaseConfig';

// Nextjs specific files
import tsConfig from './templates/tsConfig';
import nextConfig from './templates/nextConfig';
import nextTypes from './templates/nextTypes';
// App router specific files
import rootLayout from './templates/nextjs/nextjs-app/rootLayout';
import dashboardLayout from './templates/nextjs/nextjs-app/dashboardLayout';

// Pages router specific files
import app from './templates/nextjs/nextjs-pages/app';
import document from './templates/nextjs/nextjs-pages/document';

// Auth specific files for all apps
import auth from './templates/nextjs/auth/auth';
import envLocal from './templates/nextjs/auth/envLocal';
import middleware from './templates/nextjs/auth/middleware';
import routeHandler from './templates/nextjs/auth/route';
import prisma from './templates/nextjs/auth/prisma';
import env from './templates/nextjs/auth/env';
import schemaPrisma from './templates/nextjs/auth/schemaPrisma';

// Auth files for app router
import signInPage from './templates/nextjs/auth/nextjs-app/signInPage';
import signInAction from './templates/nextjs/auth/nextjs-app/actions';

// Auth files for pages router
import signInPagePagesRouter from './templates/nextjs/auth/nextjs-pages/signIn';

import { GenerateProjectOptions } from './types';

export default function generateProject(
  options: GenerateProjectOptions,
): Map<string, { content: string }> {
  // Common files regardless of framework
  const commonFiles = new Map<string, { content: string }>([
    ['theme.ts', { content: theme }],
    ['.eslintrc.json', { content: eslintConfig }],
    ['README.md', { content: readme }],
    ['.gitignore', { content: gitignore }],
    [
      'package.json',
      {
        content: JSON.stringify(packageJson(options)),
      },
    ],
  ]);

  switch (options.framework) {
    case 'vite': {
      const viteFiles = new Map([
        ['vite.config.mts', { content: viteConfig }],
        ['src/main.tsx', { content: viteMain(options) }],
        ['src/layouts/dashboard.tsx', { content: viteDashboardLayout(options) }],
        ['src/App.tsx', { content: viteApp(options) }],
        ['src/pages/index.tsx', { content: indexPage(options) }],
        ['src/pages/orders.tsx', { content: ordersPage(options) }],
        ['index.html', { content: viteHtml }],
      ]);

      if (options.auth) {
        const authFiles = new Map([
          ['src/firebase/auth.ts', { content: viteFirebaseAuth(options) }],
          ['src/firebase/firebaseConfig.ts', { content: viteFirebaseConfig(options) }],
          ['src/SessionContext.ts', { content: viteSessionContext }],
          ['.env', { content: viteEnv }],
          ['src/pages/signin.tsx', { content: viteSignIn(options) }],
        ]);

        return new Map([...commonFiles, ...viteFiles, ...authFiles]);
      }

      return new Map([...commonFiles, ...viteFiles]);
    }

    case 'nextjs':
    default: {
      const nextCommonFiles = new Map([
        ['tsconfig.json', { content: tsConfig }],
        ['next-env.d.ts', { content: nextTypes }],
        ['next.config.mjs', { content: nextConfig(options) }],
      ]);

      switch (options.router) {
        case 'nextjs-pages': {
          const nextJsPagesRouterStarter = new Map([
            ['pages/index.tsx', { content: indexPage(options) }],
            ['pages/orders/index.tsx', { content: ordersPage(options) }],
            ['pages/_document.tsx', { content: document }],
            ['pages/_app.tsx', { content: app(options) }],
          ]);
          if (options.auth) {
            const authFiles = new Map([
              ['auth.ts', { content: auth(options) }],
              ['.env.local', { content: envLocal(options) }],
              ['middleware.ts', { content: middleware }],
              // next-auth v5 does not provide an API route, so this file must be in the app router
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
              return new Map([
                ...commonFiles,
                ...nextCommonFiles,
                ...nextJsPagesRouterStarter,
                ...authFiles,
                ...prismaFiles,
              ]);
            }
            return new Map([
              ...commonFiles,
              ...nextCommonFiles,
              ...nextJsPagesRouterStarter,
              ...authFiles,
            ]);
          }
          return new Map([...commonFiles, ...nextCommonFiles, ...nextJsPagesRouterStarter]);
        }
        case 'nextjs-app':
        default: {
          const nextJsAppRouterStarter = new Map([
            ['app/(dashboard)/layout.tsx', { content: dashboardLayout }],
            ['app/layout.tsx', { content: rootLayout(options) }],
            ['app/(dashboard)/page.tsx', { content: indexPage(options) }],
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
              return new Map([
                ...commonFiles,
                ...nextCommonFiles,
                ...nextJsAppRouterStarter,
                ...authFiles,
                ...prismaFiles,
              ]);
            }

            return new Map([
              ...commonFiles,
              ...nextCommonFiles,
              ...nextJsAppRouterStarter,
              ...authFiles,
            ]);
          }
          return new Map([...commonFiles, ...nextCommonFiles, ...nextJsAppRouterStarter]);
        }
      }
    }
  }
}
