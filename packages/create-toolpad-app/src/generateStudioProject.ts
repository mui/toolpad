import studioPackageJson from './templates/studio/packageJson';
import gitignore from './templates/gitignore';

export type PackageManager = 'npm' | 'pnpm' | 'yarn';

export default function generateStudioProject(
  packageManager: PackageManager,
  name: string,
): Map<string, { content: string }> {
  const packageJson = studioPackageJson(name);

  const files = new Map<string, { content: string }>([
    ['package.json', { content: JSON.stringify(packageJson, null, 2) }],
    ['.gitignore', { content: gitignore }],
  ]);

  return files;
}