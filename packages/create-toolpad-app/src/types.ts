import type { SupportedAuthProvider } from '@toolpad/core';

import { PackageJson } from './templates/packageType';

export type SupportedRouter = 'nextjs-app' | 'nextjs-pages';
export type PackageManager = 'npm' | 'pnpm' | 'yarn';
type ProjectType = 'core' | 'studio';

export interface GenerateProjectOptions {
  name: string;
  absolutePath: string;
  auth?: boolean;
  authProviders?: SupportedAuthProvider[];
  router?: SupportedRouter;
  coreVersion?: string;
  projectType?: ProjectType;
  packageManager?: PackageManager;
}

export type Template = (options: GenerateProjectOptions) => string;

export type PackageJsonTemplate = (options: GenerateProjectOptions) => PackageJson;
