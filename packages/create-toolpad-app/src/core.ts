import chalk from 'chalk';
import { execa } from 'execa';
import type { GenerateProjectOptions } from './types';
import generateProject from './generateProject';
import writeFiles from './writeFiles';

export async function scaffoldCoreProject(options: GenerateProjectOptions): Promise<void> {
  // eslint-disable-next-line no-console
  console.log();
  // eslint-disable-next-line no-console
  console.log(
    `${chalk.cyan('info')} - Creating Toolpad Core project in ${chalk.cyan(options.absolutePath)}`,
  );
  // eslint-disable-next-line no-console
  console.log();

  const packageManager = options.packageManager;

  const files = generateProject(options);
  await writeFiles(options.absolutePath, files);

  if (options.install) {
    // eslint-disable-next-line no-console
    console.log(`${chalk.cyan('info')} - Installing dependencies`);
    // eslint-disable-next-line no-console
    console.log();

    await execa(packageManager, ['install'], {
      stdio: 'inherit',
      cwd: options.absolutePath,
    });

    // eslint-disable-next-line no-console
    console.log();
  }

  // eslint-disable-next-line no-console
  console.log(
    `${chalk.green('success')} - Created Toolpad Core project at ${chalk.cyan(options.absolutePath)}`,
  );
  // eslint-disable-next-line no-console
  console.log();

  if (options.auth) {
    // eslint-disable-next-line no-console
    console.log(
      `${chalk.cyan('info')} - Bootstrapped ${chalk.cyan('env.local')} with empty values. See https://authjs.dev/getting-started on how to add your credentials.`,
    );
    // eslint-disable-next-line no-console
    console.log();
  }
}
