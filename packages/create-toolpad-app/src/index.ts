#!/usr/bin/env node

import * as fs from 'fs/promises';
import path from 'path';
import yargs from 'yargs';

type PackageManager = 'npm' | 'pnpm' | 'yarn';

function getPackageManager(): PackageManager {
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
  return 'yarn';
}

// From https://github.com/vercel/next.js/blob/canary/packages/create-next-app/helpers/is-folder-empty.ts

async function isFolderEmpty(pathDir: string): Promise<boolean> {
  const validFiles = [
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

  const conflicts = await fs.readdir(pathDir);

  conflicts
    .filter((file) => !validFiles.includes(file))
    // Support IntelliJ IDEA-based editors
    .filter((file) => !/\.iml$/.test(file));

  if (conflicts.length > 0) {
    return false;
  }
  return true;
}

// Detect the package manager
const packageManager = getPackageManager();

const validatePath = async (relativePath: string): Promise<boolean | string> => {
  const { default: chalk } = await import('chalk');

  const absolutePath = path.join(process.cwd(), relativePath);

  try {
    await fs.mkdir(absolutePath);

    return true;
  } catch {
    // Directory exists, verify if it's empty to proceed
    try {
      if (await isFolderEmpty(absolutePath)) {
        return true;
      }
      return `${chalk.red('error')} - The directory at ${chalk.blue(
        absolutePath,
      )} contains files that could conflict. Either use a new directory, or remove conflicting files.`;
    } catch {
      return `${chalk.red('error')} - Unable to access directory at ${chalk.red(
        absolutePath,
      )}. Please provide a different path.`;
    }
  }
};

// Create a new `package.json` file and install dependencies
const scaffoldProject = async (absolutePath: string): Promise<void> => {
  const { default: chalk } = await import('chalk');
  const { execaCommand } = await import('execa');

  // eslint-disable-next-line no-console
  console.log();
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')} - Creating Toolpad project in ${chalk.blue(absolutePath)}`);
  // eslint-disable-next-line no-console
  console.log();

  const packageJson = {
    name: path.basename(absolutePath),
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'toolpad dev',
      build: 'toolpad build',
      start: 'toolpad start',
    },
  };

  await fs.writeFile(path.join(absolutePath, 'package.json'), JSON.stringify(packageJson, null, 2));

  // eslint-disable-next-line no-console
  console.log(
    `${chalk.blue('info')} - Installing the following dependencies: ${chalk.magenta(
      '@mui/toolpad',
    )}`,
  );
  // eslint-disable-next-line no-console
  console.log();

  const installVerb = packageManager === 'yarn' ? 'add' : 'install';
  const command = `${packageManager} ${installVerb} @mui/toolpad`;
  await execaCommand(command, { stdio: 'inherit', cwd: absolutePath });

  // eslint-disable-next-line no-console
  console.log();
  // eslint-disable-next-line no-console
  console.log(`${chalk.green('success')} - Dependencies installed successfully!`);
  // eslint-disable-next-line no-console
  console.log();
};

// Run the CLI interaction with Inquirer.js
const run = async () => {
  const { default: chalk } = await import('chalk');
  const { default: inquirer } = await import('inquirer');

  const args = await yargs(process.argv.slice(2))
    .scriptName('create-toolpad-app')
    .usage('$0 [path]')
    .positional('path', {
      type: 'string',
      describe: 'The path where the Toolpad project directory will be created',
    })
    .help().argv;

  const pathArg = args._?.[0] as string;

  if (pathArg) {
    const pathValidOrError = await validatePath(pathArg);
    if (typeof pathValidOrError === 'string') {
      // eslint-disable-next-line no-console
      console.log();
      // eslint-disable-next-line no-console
      console.log(pathValidOrError);
      // eslint-disable-next-line no-console
      console.log();
      process.exit(1);
    }
  }

  const questions = [
    {
      type: 'input',
      name: 'path',
      message: 'Enter path for new project directory:',
      validate: (input: string) => validatePath(input),
      when: !pathArg,
      default: '.',
    },
  ];

  const answers = await inquirer.prompt(questions);

  const absolutePath = path.join(process.cwd(), answers.path || pathArg);

  await scaffoldProject(absolutePath);

  const changeDirectoryInstruction =
    /* `path.relative` is truth-y if the relative path
     * between `absolutePath` and `process.cwd()`
     * is not empty
     */
    path.relative(process.cwd(), absolutePath)
      ? `cd ${path.relative(process.cwd(), absolutePath)} && `
      : '';

  const message = `Run the following to get started: \n\n${chalk.magentaBright(
    `${changeDirectoryInstruction}${packageManager}${packageManager === 'yarn' ? '' : ' run'} dev`,
  )}`;
  // eslint-disable-next-line no-console
  console.log(message);
  // eslint-disable-next-line no-console
  console.log();
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
