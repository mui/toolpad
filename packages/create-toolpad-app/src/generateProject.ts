import path from 'path';

import {
  packageJson,
  packageJsonAuthApp,
  dashboardLayoutContent,
  dashboardLayoutAuthAppContent,
  dashboardPageContent,
  dashboardPageAuthAppContent,
  dashboardPageLayoutContent,
  rootLayoutContent,
  rootLayoutAuthAppContent,
  rootPageContainer,
  themeContent,
  readmeContent,
  nextTypesContent,
  nextConfigContent,
  gitignoreTemplate,
  eslintConfigContent,
  tsConfigContent,
  authImports,
  providerSetupContent,
  providerMapContent,
  authContentEnd,
  middlewareContent,
  authRouterHandlerContent,
  signInPageContent,
  providerImport,
  oAuthProviderContent,
  credentialsProviderContent,
  callbacksContent,
  providerEnvContent,
  authEnvContent,
} from './templates';

export type SupportedRouter = 'nextjs-app' | 'nextjs-pages';
export type SupportedAuthProvider = 'Credentials' | 'Google' | 'GitHub' | 'Facebook';
export interface GenerateProjectOptions {
  name: string;
  absolutePath: string;
  router: SupportedRouter;
  auth: boolean;
  authProviders: SupportedAuthProvider[];
}

export default function generateProject(
  options: GenerateProjectOptions,
): Map<string, { content: string }> {
  // Add app name to package.json
  packageJson.name = path.basename(options.name);

  // Default files, common to all apps
  const files = new Map<string, { content: string }>([
    ['theme.ts', { content: themeContent }],
    ['next-env.d.ts', { content: nextTypesContent }],
    ['next.config.mjs', { content: nextConfigContent }],
    ['.eslintrc.json', { content: eslintConfigContent }],
    ['tsconfig.json', { content: tsConfigContent }],
    ['package.json', { content: JSON.stringify(packageJson, null, 2) }],
    ['README.md', { content: readmeContent }],
    ['.gitignore', { content: gitignoreTemplate }],
  ]);

  switch (options.router) {
    case 'nextjs-pages': {
      return files;
    }
    case 'nextjs-app':
    default: {
      const nextJsAppRouterStarter = new Map([
        ['app/(dashboard)/layout.tsx', { content: dashboardLayoutContent }],
        ['app/layout.tsx', { content: rootLayoutContent }],
      ]);
      if (options.auth) {
        // Add additional specific to authentication
        let providerImports = '';
        let providerContent = '';
        let envProviderContent = '';

        options.authProviders.forEach((provider) => {
          providerImports += providerImport(provider);
          providerContent +=
            provider === 'Credentials'
              ? credentialsProviderContent
              : oAuthProviderContent(provider);
          envProviderContent += provider === 'Credentials' ? '' : providerEnvContent(provider);
        });

        const authCallbacksContent = options.authProviders.includes('Credentials')
          ? callbacksContent
          : '';

        const authContent = `${authImports}${providerImports}${providerSetupContent}${providerContent}${providerMapContent}${authCallbacksContent}${authContentEnd}`;
        const envContent = `${authEnvContent}${envProviderContent}`;

        const authFiles = new Map([
          ['auth.ts', { content: authContent }],
          ['.env.local', { content: envContent }],
          ['middleware.ts', { content: middlewareContent }],
          ['app/api/auth/[...nextAuth]/route.ts', { content: authRouterHandlerContent }],
          ['app/auth/signin/page.tsx', { content: signInPageContent }],
        ]);
        // Add app name to package.json
        packageJsonAuthApp.name = path.basename(options.name);

        // Replace default files with auth-specific content
        files.set('package.json', {
          content: JSON.stringify(packageJsonAuthApp, null, 2),
        });

        // Replace default next-js-app starter files with auth-specific content
        nextJsAppRouterStarter.set('app/(dashboard)/page.tsx', {
          content: dashboardPageAuthAppContent,
        });
        nextJsAppRouterStarter.set('app/(dashboard)/layout.tsx', {
          content: dashboardLayoutAuthAppContent,
        });
        nextJsAppRouterStarter.set('app/layout.tsx', {
          content: rootLayoutAuthAppContent,
        });
        nextJsAppRouterStarter.delete('app/page.tsx');

        return new Map([...files, ...nextJsAppRouterStarter, ...authFiles]);
      }
      nextJsAppRouterStarter.set('app/(dashboard)/page/page.tsx', {
        content: dashboardPageContent,
      });
      nextJsAppRouterStarter.set('app/(dashboard)/page/layout.tsx', {
        content: dashboardPageLayoutContent,
      });
      nextJsAppRouterStarter.set('app/page.tsx', { content: rootPageContainer });
      return new Map([...files, ...nextJsAppRouterStarter]);
    }
  }
}
