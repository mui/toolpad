import path from 'path';

import {
  packageJson,
  dashboardLayoutContent,
  dashboardPage,
  dashboardPageLayout,
  rootLayoutContent,
  rootPageContainer,
  themeContent,
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

  if (options.router === 'nextjs-app') {
    const nextJsAppRouterStarter = new Map([
      ['app/(dashboard)/page/page.tsx', { content: dashboardPage }],
      ['app/(dashboard)/page/layout.tsx', { content: dashboardPageLayout }],
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
      // ...
    ]);
    if (options.auth) {
      // Add additional files for authentication
      const authFiles = new Map([
        ['auth.ts', { content: authContent }],
        ['middleware.ts', { content: middlewareContent }],
        ['app/api/auth/[...nextAuth]/route.ts', { content: authRouterHandlerContent }],
        ['app/auth/signin.tsx', { content: signInPageContent }],
      ]);
      // Replace some existing file content with auth-specific content
      nextJsAppRouterStarter.set('app/(dashboard)/page.tsx', {
        content: dashboardPageAuthContent,
      });
      return new Map([...nextJsAppRouterStarter, ...authFiles]);
    }
  }

  return new Map([
    ['pages/api/auth/[...nextAuth].ts', { content: '' }],
    ['pages/auth/[...path].tsx', { content: '' }],
    ['pages/dashboard/page.tsx', { content: dashboardPage }],
    ['pages/dashboard/layout.tsx', { content: dashboardLayoutContent }],
    ['pages/layout.tsx', { content: rootLayoutContent }],
    ['pages/page.tsx', { content: rootPageContainer }],
    ['theme.ts', { content: themeContent }],
    ['next-env.d.ts', { content: nextTypesContent }],
    ['next.config.mjs', { content: nextConfigContent }],
    ['.eslintrc.json', { content: eslintConfigContent }],
    ['tsconfig.json', { content: tsConfigContent }],
    ['package.json', { content: JSON.stringify(packageJson, null, 2) }],
    ['.gitignore', { content: gitignoreTemplate }],
    // ...
  ]);
}
