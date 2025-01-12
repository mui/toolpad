import * as fs from 'fs/promises';
import { constants as fsConstants } from 'fs';
import chalk from 'chalk';
import { errorFrom } from '@toolpad/utils/errors';
import { bashResolvePath } from '@toolpad/utils/cli';

const VALID_FILES = [
  '.DS_Store',
  '.git',
  '.gitattributes',
  '.gitignore',
  '.gitlab-ci.yml',
  '.hg',
  '.hgcheck',
  '.hgignore',
  '.idea',
  '.npmignore',
  '.travis.yml',
  'LICENSE',
  'Thumbs.db',
  'docs',
  'mkdocs.yml',
  'npm-debug.log',
  'yarn-debug.log',
  'yarn-error.log',
  'yarnrc.yml',
  '.yarn',
];

export async function isFolderEmpty(pathDir: string): Promise<boolean> {
  const conflicts = await fs.readdir(pathDir);

  conflicts.filter((file) => !VALID_FILES.includes(file)).filter((file) => !/\.iml$/.test(file));

  return conflicts.length === 0;
}

export async function validatePath(
  relativePath: string,
  emptyCheck?: boolean,
): Promise<boolean | string> {
  const absolutePath = bashResolvePath(relativePath);

  try {
    await fs.access(absolutePath, fsConstants.F_OK);

    if (emptyCheck) {
      if (await isFolderEmpty(absolutePath)) {
        return true;
      }

      return `${chalk.red('error')} - The directory at ${chalk.cyan(
        absolutePath,
      )} contains files that could conflict. Either use a new directory, or remove conflicting files.`;
    }
    return true;
  } catch (rawError: unknown) {
    const error = errorFrom(rawError);
    if (error.code === 'ENOENT') {
      await fs.mkdir(absolutePath, { recursive: true });
      return true;
    }
    throw error;
  }
}
