import theme from './templates/theme';
import eslintConfig from './templates/eslintConfig';
import nextConfig from './templates/nextConfig';
import nextTypes from './templates/nextTypes';
import tsConfig from './templates/tsConfig';
import packageJson from './templates/packageJson';
import readme from './templates/readme';
import gitignore from './templates/gitignore';

import rootLayout from './templates/rootLayout';
import rootPage from './templates/rootPage';
import dashboardLayout from './templates/dashboardLayout';
import dashboardPage from './templates/dashboardPage';

import indexPage from './templates/nextjs-pages/indexPage';
import ordersPage from './templates/nextjs-pages/ordersPage';
import app from './templates/nextjs-pages/app';
import document from './templates/nextjs-pages/document';

import providerImport from './templates/auth/providerImport';
import credentialsProvider from './templates/auth/credentialsProvider';
import oAuthProvider from './templates/auth/oAuthProvider';
import providerSetup from './templates/auth/providerSetup';
import callbacks from './templates/auth/callbacks';
import providerMap from './templates/auth/providerMap';
import authImport from './templates/auth/import';
import authEnv from './templates/auth/env';
import authProviderEnv from './templates/auth/providerEnv';
import middleware from './templates/auth/middleware';

import routeHandler from './templates/auth/nextjs-app/route';
import signInPage from './templates/auth/nextjs-app/signInPage';
import packageJsonAuth from './templates/auth/packageJson';
import dashboardPageAuthApp from './templates/auth/nextjs-app/dashboardPage';
import rootLayoutAuthApp from './templates/auth/nextjs-app/rootLayout';

import appAuthPages from './templates/auth/nextjs-pages/app';
import signInPagePagesRouter from './templates/auth/nextjs-pages/signIn';

export type SupportedRouter = 'nextjs-app' | 'nextjs-pages';
export type SupportedAuthProvider = 'Credentials' | 'Google' | 'GitHub' | 'Facebook';
export interface GenerateProjectOptions {
  name: string;
  absolutePath: string;
  router: SupportedRouter;
  auth: boolean;
  authProviders: SupportedAuthProvider[];
}

function generateAuthContent(authProviders: SupportedAuthProvider[]) {
  // Add additional specific to authentication
  let providerImports = '';
  let providerContent = '';
  let envProviderContent = '';

  authProviders.forEach((provider) => {
    providerImports += providerImport(provider);
    providerContent += provider === 'Credentials' ? credentialsProvider : oAuthProvider(provider);
    envProviderContent += provider === 'Credentials' ? '' : authProviderEnv(provider);
  });

  const authCallbacksContent = authProviders.includes('Credentials') ? callbacks : '';

  const authContent = `${authImport}${providerImports}${providerSetup}${providerContent}${providerMap}${authCallbacksContent}});        
  `;
  const envContent = `${authEnv}${envProviderContent}`;

  return {
    authContent,
    envContent,
    authCallbacksContent,
  };
}

export default function generateProject(
  options: GenerateProjectOptions,
): Map<string, { content: string }> {
  // Add app name to package.json
  const packageJsonContent = packageJson(options.name);

  // Default files, common to all apps
  const files = new Map<string, { content: string }>([
    ['theme.ts', { content: theme }],
    ['next-env.d.ts', { content: nextTypes }],
    ['next.config.mjs', { content: nextConfig }],
    ['.eslintrc.json', { content: eslintConfig }],
    ['tsconfig.json', { content: tsConfig }],
    ['package.json', { content: JSON.stringify(packageJsonContent, null, 2) }],
    ['README.md', { content: readme }],
    ['.gitignore', { content: gitignore }],
  ]);

  switch (options.router) {
    case 'nextjs-pages': {
      const nextJsPagesRouterStarter = new Map([
        ['pages/index.tsx', { content: indexPage }],
        ['pages/orders/index.tsx', { content: ordersPage }],
        ['pages/_app.tsx', { content: app }],
        ['pages/_document.tsx', { content: document }],
      ]);
      if (options.auth) {
        const { authContent, envContent } = generateAuthContent(options.authProviders);
        const authFiles = new Map([
          ['auth.ts', { content: authContent }],
          ['.env.local', { content: envContent }],
          ['middleware.ts', { content: middleware }],
          ['app/api/auth/[...nextAuth]/route.ts', { content: routeHandler }],
          ['pages/auth/signin.tsx', { content: signInPagePagesRouter }],
          ['package.json', { content: JSON.stringify(packageJsonAuth(options.name), null, 2) }],
          ['pages/_app.tsx', { content: appAuthPages }],
        ]);
        return new Map([...files, ...nextJsPagesRouterStarter, ...authFiles]);
      }
      return new Map([...files, ...nextJsPagesRouterStarter]);
    }
    case 'nextjs-app':
    default: {
      const nextJsAppRouterStarter = new Map([
        ['app/(dashboard)/layout.tsx', { content: dashboardLayout }],
        ['app/layout.tsx', { content: rootLayout }],
        ['app/page.tsx', { content: rootPage }],
        ['app/(dashboard)/page/page.tsx', { content: dashboardPage }],
      ]);
      if (options.auth) {
        const { authContent, envContent } = generateAuthContent(options.authProviders);

        const authFiles = new Map([
          ['auth.ts', { content: authContent }],
          ['.env.local', { content: envContent }],
          ['middleware.ts', { content: middleware }],
          ['app/api/auth/[...nextAuth]/route.ts', { content: routeHandler }],
          ['app/auth/signin/page.tsx', { content: signInPage }],
          ['package.json', { content: JSON.stringify(packageJsonAuth(options.name), null, 2) }],
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
