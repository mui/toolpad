// Common files for all apps
import theme from './templates/theme';
import eslintConfig from './templates/eslintConfig';
import nextConfig from './templates/nextConfig';
import nextTypes from './templates/nextTypes';
import tsConfig from './templates/tsConfig';
import readme from './templates/readme';
import gitignore from './templates/gitignore';
import ordersPage from './templates/ordersPage';

// App router specific files
import packageJsonApp from './templates/packageJson';
import rootLayout from './templates/rootLayout';
import rootPage from './templates/rootPage';
import NavigateButton from './templates/navigateButton';
import dashboardLayout from './templates/dashboardLayout';
import dashboardPage from './templates/dashboardPage';

// Pages router specific files
import packageJsonPages from './templates/nextjs-pages/packageJson';
import indexPage from './templates/nextjs-pages/indexPage';

import app from './templates/nextjs-pages/app';
import document from './templates/nextjs-pages/document';

// Auth specific files for all apps
import auth from './templates/auth/auth';
import envLocal from './templates/auth/envLocal';
import middleware from './templates/auth/middleware';

// Auth files for app router
import routeHandler from './templates/auth/nextjs-app/route';
import signInPage from './templates/auth/nextjs-app/signInPage';
import packageJsonAuthApp from './templates/auth/nextjs-app/packageJson';
import dashboardPageAuthApp from './templates/auth/nextjs-app/dashboardPage';
import rootLayoutAuthApp from './templates/auth/nextjs-app/rootLayout';

// Auth files for pages router
import packageJsonAuthPages from './templates/auth/nextjs-pages/packageJson';
import appAuthPages from './templates/auth/nextjs-pages/app';
import signInPagePagesRouter from './templates/auth/nextjs-pages/signIn';

import { SupportedAuthProvider, SupportedRouter } from './types';

export interface GenerateProjectOptions {
  name: string;
  absolutePath: string;
  auth: boolean;
  authProviders: SupportedAuthProvider[];
  coreVersion?: string;
  router: SupportedRouter;
}

export default function generateProject(
  options: GenerateProjectOptions,
): Map<string, { content: string }> {
  // Add app name to package.json

  // Default files, common to all apps
  const files = new Map<string, { content: string }>([
    ['theme.ts', { content: theme }],
    ['next-env.d.ts', { content: nextTypes }],
    ['next.config.mjs', { content: nextConfig }],
    ['.eslintrc.json', { content: eslintConfig }],
    ['tsconfig.json', { content: tsConfig }],
    ['README.md', { content: readme }],
    ['.gitignore', { content: gitignore }],
  ]);
  const hasCredentialsProvider = options.authProviders.includes('Credentials');

  switch (options.router) {
    case 'nextjs-pages': {
      const packageJsonPagesContent = packageJsonPages(options.name, options.coreVersion);
      const nextJsPagesRouterStarter = new Map([
        ['package.json', { content: JSON.stringify(packageJsonPagesContent, null, 2) }],
        ['pages/index.tsx', { content: indexPage }],
        ['pages/orders/index.tsx', { content: ordersPage }],
        ['pages/_app.tsx', { content: app }],
        ['pages/_document.tsx', { content: document }],
      ]);
      if (options.auth) {
        const packageJsonAuthPagesContent = packageJsonAuthPages(options.name, options.coreVersion);
        const authFiles = new Map([
          ['auth.ts', { content: auth(options.authProviders) }],
          ['.env.local', { content: envLocal(options.authProviders) }],
          ['middleware.ts', { content: middleware }],
          ['app/api/auth/[...nextAuth]/route.ts', { content: routeHandler }],
          ['pages/auth/signin.tsx', { content: signInPagePagesRouter(hasCredentialsProvider) }],
          ['package.json', { content: JSON.stringify(packageJsonAuthPagesContent, null, 2) }],
          ['pages/_app.tsx', { content: appAuthPages }],
        ]);
        return new Map([...files, ...nextJsPagesRouterStarter, ...authFiles]);
      }
      return new Map([...files, ...nextJsPagesRouterStarter]);
    }
    case 'nextjs-app':
    default: {
      const packageJsonAppContent = packageJsonApp(options.name, options.coreVersion);
      const nextJsAppRouterStarter = new Map([
        ['package.json', { content: JSON.stringify(packageJsonAppContent, null, 2) }],
        ['app/(dashboard)/layout.tsx', { content: dashboardLayout }],
        ['app/layout.tsx', { content: rootLayout }],
        ['app/page.tsx', { content: rootPage }],
        ['app/NavigateButton.tsx', { content: NavigateButton }],
        ['app/(dashboard)/page/page.tsx', { content: dashboardPage }],
        ['app/(dashboard)/orders/page.tsx', { content: ordersPage }],
      ]);
      if (options.auth) {
        const packageJsonAuthAppContent = packageJsonAuthApp(options.name, options.coreVersion);

        const authFiles = new Map([
          ['auth.ts', { content: auth(options.authProviders) }],
          ['.env.local', { content: auth(options.authProviders) }],
          ['middleware.ts', { content: middleware }],
          ['app/api/auth/[...nextAuth]/route.ts', { content: routeHandler }],
          ['app/auth/signin/page.tsx', { content: signInPage(hasCredentialsProvider) }],
          ['package.json', { content: JSON.stringify(packageJsonAuthAppContent, null, 2) }],
          ['app/(dashboard)/page.tsx', { content: dashboardPageAuthApp }],
          ['app/layout.tsx', { content: rootLayoutAuthApp }],
        ]);

        nextJsAppRouterStarter.delete('app/page.tsx');
        nextJsAppRouterStarter.delete('app/(dashboard)/page/page.tsx');

        return new Map([...files, ...nextJsAppRouterStarter, ...authFiles]);
      }
      return new Map([...files, ...nextJsAppRouterStarter]);
    }
  }
}
