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
  authContent,
  middlewareContent,
  authRouterHandlerContent,
  signInPageContent,
  providerImport,
  oAuthProviderContent,
  credentialsProviderContent,
  callbacksContent,
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
  packageJson.name = path.basename(options.name);

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
        ['app/(dashboard)/page/page.tsx', { content: dashboardPageContent }],
        ['app/(dashboard)/page/layout.tsx', { content: dashboardPageLayoutContent }],
        ['app/layout.tsx', { content: rootLayoutContent }],
        ['app/page.tsx', { content: rootPageContainer }],
        // ...
      ]);
      if (options.auth) {
        // Add additional files for authentication
        let replacedAuthContent = authContent;
        if (options.authProviders.length) {
          const authImports = options.authProviders
            .map((provider) => providerImport(provider))
            .join('');
          const providerContent = options.authProviders
            .map((provider) => {
              return provider === 'Credentials'
                ? credentialsProviderContent
                : oAuthProviderContent(provider);
            })
            .join('\n');
          replacedAuthContent = authContent.replace('// PROVIDER_IMPORTS', authImports);
          replacedAuthContent = replacedAuthContent.replace('// PROVIDER_CONTENT', providerContent);
          if (options.authProviders.includes('Credentials')) {
            replacedAuthContent = replacedAuthContent.replace(
              '// CALLBACKS_CONTENT',
              callbacksContent,
            );
          } else {
            replacedAuthContent = replacedAuthContent.replace('// CALLBACKS_CONTENT', '');
          }
        } else {
          replacedAuthContent = authContent.replace('// PROVIDER_IMPORTS', '');
          replacedAuthContent = replacedAuthContent.replace('// PROVIDER_CONTENT', '');
          replacedAuthContent = replacedAuthContent.replace('// CALLBACKS_CONTENT', '');
        }
        const authFiles = new Map([
          ['auth.ts', { content: replacedAuthContent }],
          ['middleware.ts', { content: middlewareContent }],
          ['app/api/auth/[...nextAuth]/route.ts', { content: authRouterHandlerContent }],
          ['app/auth/signin/page.tsx', { content: signInPageContent }],
        ]);
        // Replace existing file content with auth-specific content
        packageJsonAuthApp.name = path.basename(options.name);
        files.set('package.json', {
          content: JSON.stringify(packageJsonAuthApp, null, 2),
        });
        nextJsAppRouterStarter.delete('app/(dashboard)/page/page.tsx');
        nextJsAppRouterStarter.set('app/(dashboard)/page.tsx', {
          content: dashboardPageAuthAppContent,
        });
        nextJsAppRouterStarter.delete('app/(dashboard)/page/layout.tsx');
        nextJsAppRouterStarter.set('app/(dashboard)/layout.tsx', {
          content: dashboardLayoutAuthAppContent,
        });
        nextJsAppRouterStarter.set('app/layout.tsx', {
          content: rootLayoutAuthAppContent,
        });
        nextJsAppRouterStarter.delete('app/page.tsx');

        return new Map([...files, ...nextJsAppRouterStarter, ...authFiles]);
      }
      return new Map([...files, ...nextJsAppRouterStarter]);
    }
  }
}
