import * as path from 'path';
import latestVersion from 'latest-version';
import * as semver from 'semver';
import { fileExists } from '@toolpad/utils/fs';
import pkg from '../../package.json';

export type PackageManager = 'npm' | 'yarn' | 'pnpm';

async function detectPackageManager(root: string) {
  const [hasYarnLock, hasPackageLock, hasPnpmLock] = await Promise.all([
    fileExists(path.resolve(root, './yarn.lock')),
    fileExists(path.resolve(root, './package-lock.lock')),
    fileExists(path.resolve(root, './pnpm-lock.lock')),
  ]);

  if (hasYarnLock) {
    return 'yarn';
  }

  if (hasPnpmLock) {
    return 'pnpm';
  }

  if (hasPackageLock) {
    return 'npm';
  }

  return null;
}

export interface VersionInfo {
  current: string;
  latest: string;
  updateAvailable: boolean;
  packageManager: PackageManager | null;
}

export async function checkVersion(root: string): Promise<VersionInfo> {
  const pkgName = '@toolpad/studio';
  const [latest, packageManager] = await Promise.all([
    latestVersion(pkgName),
    detectPackageManager(root),
  ]);
  const current = pkg.version;
  const updateAvailable = semver.compare(latest, current) > 0;
  return { current, latest, updateAvailable, packageManager };
}
