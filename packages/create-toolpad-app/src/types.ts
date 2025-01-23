import type { SupportedAuthProvider } from '@toolpad/core/SignInPage';
import { PackageJson } from './packageType';

export type SupportedRouter = 'nextjs-app' | 'nextjs-pages';
export type PackageManager = 'npm' | 'pnpm' | 'yarn';
export type SupportedFramework = 'nextjs' | 'vite';

type ProjectType = 'core' | 'studio';

export interface GenerateProjectOptions {
  name: string;
  absolutePath: string;
  auth?: boolean;
  authProviders?: SupportedAuthProvider[];
  hasNodemailerProvider?: boolean;
  hasCredentialsProvider?: boolean;
  hasPasskeyProvider?: boolean;
  install?: boolean;
  router?: SupportedRouter;
  framework?: SupportedFramework;
  coreVersion?: string;
  projectType?: ProjectType;
  packageManager: PackageManager;
}

export type Template = (options: GenerateProjectOptions) => string;

export type PackageJsonTemplate = (options: GenerateProjectOptions) => PackageJson;
