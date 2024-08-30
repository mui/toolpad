import type { SupportedAuthProvider } from '@toolpad/core';

import { PackageJson } from './templates/packageType';

export type SupportedRouter = 'nextjs-app' | 'nextjs-pages';
export type PackageManager = 'npm' | 'pnpm' | 'yarn';

export type ProviderTemplate = (provider: SupportedAuthProvider) => string;

export type ProvidersTemplate = (providers: SupportedAuthProvider[]) => string;

export type BooleanTemplate = (value: boolean) => string;

export type PackageJsonTemplate = (appName: string, coreVersion?: string) => PackageJson;
