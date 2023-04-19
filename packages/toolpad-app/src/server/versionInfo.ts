import latestVersion from 'latest-version';
import * as semver from 'semver';
import * as path from 'path';
import pkg from '../../package.json';
import { VERSION_CHECK_INTERVAL } from '../constants';
import { fileExists } from '../utils/fs';
import { getUserProjectRoot } from './localMode';

export type PackageManager = 'npm' | 'yarn' | 'pnpm';

async function detectPackageManager() {
  const root = getUserProjectRoot();
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

async function checkVersion(): Promise<VersionInfo> {
  const pkgName = '@mui/toolpad';
  const [latest, packageManager] = await Promise.all([
    latestVersion(pkgName),
    detectPackageManager(),
  ]);
  const current = pkg.version;
  const updateAvailable = semver.compare(latest, current) > 0;
  return { current, latest, updateAvailable, packageManager };
}

let lastCheck = 0;
let pendingCheck: Promise<VersionInfo> | undefined;

export async function getVersionInfo(): Promise<VersionInfo> {
  const now = Date.now();
  if (!pendingCheck || lastCheck + VERSION_CHECK_INTERVAL <= now) {
    lastCheck = now;
    pendingCheck = checkVersion();
  }

  return pendingCheck;
}
