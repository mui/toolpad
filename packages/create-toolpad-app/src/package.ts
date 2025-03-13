import path from 'path';
import * as fs from 'fs/promises';
import type { PackageManager } from './types';
import type { PackageJson } from './packageType';

export function getPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent) {
    if (userAgent.startsWith('yarn')) {
      return 'yarn';
    }
    if (userAgent.startsWith('pnpm')) {
      return 'pnpm';
    }
    if (userAgent.startsWith('npm')) {
      return 'npm';
    }
  }
  return 'pnpm';
}

export async function findCtaPackageJson(): Promise<PackageJson> {
  const ctaPackageJsonPath = path.resolve(__dirname, '../package.json');
  const content = await fs.readFile(ctaPackageJsonPath, 'utf8');
  const packageJson = JSON.parse(content);
  return packageJson;
}
