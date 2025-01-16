import path from 'path';
import chalk from 'chalk';
import { execa } from 'execa';

import type { PackageManager, GenerateProjectOptions } from './types';
import generateStudioProject from './generateStudioProject';
import writeFiles from './writeFiles';

export async function scaffoldStudioProject(
  absolutePath: string,
  installFlag: boolean,
  packageManager: PackageManager,
): Promise<void> {
  // eslint-disable-next-line no-console
  console.log();
  // eslint-disable-next-line no-console
  console.log(
    `${chalk.cyan('info')} - Creating Toolpad Studio project in ${chalk.cyan(absolutePath)}`,
  );
  // eslint-disable-next-line no-console
  console.log();

  const options: GenerateProjectOptions = {
    name: path.basename(absolutePath),
    absolutePath,
    projectType: 'studio',
    packageManager,
  };

  const files = generateStudioProject(options);
  await writeFiles(absolutePath, files);

  if (installFlag) {
    // eslint-disable-next-line no-console
    console.log(`${chalk.cyan('info')} - Installing dependencies`);
    // eslint-disable-next-line no-console
    console.log();

    await execa(packageManager, ['install'], { stdio: 'inherit', cwd: absolutePath });

    // eslint-disable-next-line no-console
    console.log();
    // eslint-disable-next-line no-console
    console.log(`${chalk.green('success')} - Dependencies installed successfully!`);
    // eslint-disable-next-line no-console
    console.log();
  }
}
