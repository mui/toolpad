import path from 'path';

import {
  packageJson,
  packageJsonAuthApp,
  dashboardLayoutContent,
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
} from './templates';

export type SupportedRouter = 'nextjs-app' | 'nextjs-pages';
export type SupportedAuthProvider = 'credentials' | 'google' | 'github' | 'facebook';
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

  if (options.router === 'nextjs-app') {
    const nextJsAppRouterStarter = new Map([
      ['app/(dashboard)/page/page.tsx', { content: dashboardPageContent }],
      ['app/(dashboard)/page/layout.tsx', { content: dashboardPageLayoutContent }],
      ['app/(dashboard)/layout.tsx', { content: dashboardLayoutContent }],
      ['app/layout.tsx', { content: rootLayoutAuthAppContent }],      
      // ...
    ]);
    if (options.auth) {
      // Add additional files for authentication
      const authFiles = new Map([
        ['auth.ts', { content: authContent }],
        ['middleware.ts', { content: middlewareContent }],
        ['app/api/auth/[...nextAuth]/route.ts', { content: authRouterHandlerContent }],
        ['app/auth/signin/page.tsx', { content: signInPageContent }],
      ]);
      // Replace existing file content with auth-specific content
      files.set('package.json', {
        content: JSON.stringify(packageJsonAuthApp, null, 2),
      });
      nextJsAppRouterStarter.set('app/(dashboard)/page.tsx', {
        content: dashboardPageAuthAppContent,
      });
      nextJsAppRouterStarter.set('app/layout.tsx', {
        content: rootLayoutAuthAppContent,
      });
      return new Map([...files, ...nextJsAppRouterStarter, ...authFiles]);
    }
  }

  const files =  new Map([
    ['app/api/auth/[...nextAuth]/route.ts', { content: '' }],
    ['app/auth/[...path]/page.tsx', { content: '' }],    
    ['app/(dashboard)/page/layout.tsx', { content: dashboardPageLayoutContent }],
    ['app/(dashboard)/layout.tsx', { content: dashboardLayoutContent }],
    ['app/layout.tsx', { content: rootLayoutContent }],
    ['app/page.tsx', { content: rootPageContainer }],
    ['theme.ts', { content: themeContent }],
    ['next-env.d.ts', { content: nextTypesContent }],
    ['next.config.mjs', { content: nextConfigContent }],
    ['.eslintrc.json', { content: eslintConfigContent }],
    ['tsconfig.json', { content: tsConfigContent }],
    ['package.json', { content: JSON.stringify(packageJson, null, 2) }],
    ['.gitignore', { content: gitignoreTemplate }],    
  ]);
}
}
