import packageJson from './templates/packageJson';
import gitignore from './templates/gitignore';
import type { GenerateProjectOptions } from './types';

export default function generateStudioProject(
  options: GenerateProjectOptions,
): Map<string, { content: string }> {
  const files = new Map<string, { content: string }>([
    ['package.json', { content: JSON.stringify(packageJson(options), null, 2) }],
    ['.gitignore', { content: gitignore }],
  ]);

  return files;
}
