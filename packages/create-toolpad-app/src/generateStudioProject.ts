import packageJson from './templates/packageJson';
import gitignore from './templates/gitignore';
import type { PackageManager } from './types';

export default function generateStudioProject(
  packageManager: PackageManager,
  name: string,
): Map<string, { content: string }> {
  const files = new Map<string, { content: string }>([
    ['package.json', { content: JSON.stringify(packageJson(name, 'studio'), null, 2) }],
    ['.gitignore', { content: gitignore }],
  ]);

  return files;
}
