import { PackageJson } from './templates/packageType';

// https://authjs.dev/reference/core/providers#oauthconfigprofile
type SupportedOAuthProvider = 'facebook' | 'github' | 'google';

// https://authjs.dev/reference/core/providers#providertype
export type SupportedAuthProvider = SupportedOAuthProvider | 'credentials';

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
