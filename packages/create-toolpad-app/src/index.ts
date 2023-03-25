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
  const { default: chalk } = await import('chalk');
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
    // eslint-disable-next-line no-console
    console.log(`The directory at ${chalk.green(pathDir)} contains files that could conflict:`);
    // eslint-disable-next-line no-console
    console.log();
    for (const file of conflicts) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const stats = await fs.lstat(path.join(pathDir, file));
        if (stats.isDirectory()) {
          // eslint-disable-next-line no-console
          console.log(`  ${chalk.blue(file)}/`);
        } else {
          // eslint-disable-next-line no-console
          console.log(`  ${file}`);
        }
      } catch {
        // eslint-disable-next-line no-console
        console.log(`  ${file}`);
      }
    }
    // eslint-disable-next-line no-console
    console.log();
    return false;
  }
  return true;
}

// Detect the package manager
const packageManager = getPackageManager();

// Install the dependencies
const installDeps = async (absolutePath: string) => {
  const { execaCommand } = await import('execa');
  const { default: chalk } = await import('chalk');
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')} - Installing dependencies`);
  // eslint-disable-next-line no-console
  console.log();

  const installVerb = packageManager === 'yarn' ? 'add' : 'install';
  const command = `${packageManager} ${installVerb} @mui/toolpad`;
  await execaCommand(command, { stdio: 'inherit', cwd: absolutePath });

  // eslint-disable-next-line no-console
  console.log(`${chalk.green('success')} - Dependencies installed successfully!`);
  // eslint-disable-next-line no-console
  console.log();
};

// Create a new directory and initialize a new project
const scaffoldProject = async (absolutePath: string): Promise<string | undefined> => {
  const { default: chalk } = await import('chalk');
  const { default: inquirer } = await import('inquirer');
  // eslint-disable-next-line no-console
  console.log(`Creating a new MUI Toolpad project in ${chalk.blue(absolutePath)}`);
  // eslint-disable-next-line no-console
  console.log();
  try {
    await fs.mkdir(absolutePath);

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

    await fs.writeFile(
      path.join(absolutePath, 'package.json'),
      JSON.stringify(packageJson, null, 2),
    );
    return absolutePath;
  } catch (error) {
    // Directory exists, verify if it is empty to continue
    if (!(await isFolderEmpty(absolutePath))) {
      // eslint-disable-next-line no-console
      console.log('Either try using a new directory name, or remove the files listed above.');
      // eslint-disable-next-line no-console
      console.log();
      return undefined;
    }
    try {
      await fs.access(absolutePath, fs.constants.W_OK);

      const installDependenciesConsent = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'installInExisting',
          message: `The following dependencies will be installed: ${chalk.magentaBright(
            '@mui/toolpad',
          )}. Do you want to continue?`,
          default: false,
        },
      ]);

      if (installDependenciesConsent.installInExisting) {
        return absolutePath;
      }
      console.error(`${chalk.red('error')} - Dependencies are required to be installed.`);
      // eslint-disable-next-line no-console
      console.log();
      process.exit(1);
    } catch (err) {
      console.error(
        `Unable to create directory at ${chalk.red(
          absolutePath,
        )}. Please provide a different path.`,
      );
      // eslint-disable-next-line no-console
      console.log();
    }
    return undefined;
  }
};

// Run the CLI interaction with Inquirer.js
const run = async () => {
  const { default: chalk } = await import('chalk');
  const { default: inquirer } = await import('inquirer');
  const args = await yargs(process.argv.slice(2))
    .scriptName('create-toolpad-app')
    .usage('$0 <path>')
    .positional('path', {
      type: 'string',
      describe: 'The path where the project directory will be created',
    })
    .help().argv;
  let absolutePath;
  const pathArg = args._?.[0] as string;
  do {
    if (!pathArg) {
      // eslint-disable-next-line no-await-in-loop
      const pathPrompt = await inquirer.prompt([
        {
          type: 'input',
          name: 'path',
          message: 'Enter path for new project directory:',
          default: '.',
        },
      ]);
      // eslint-disable-next-line no-await-in-loop
      absolutePath = await scaffoldProject(pathPrompt.path);
    } else {
      // eslint-disable-next-line no-await-in-loop
      absolutePath = await scaffoldProject(path.join(process.cwd(), pathArg));
    }
  } while (!absolutePath);
  await installDeps(absolutePath);

  const message = `\nRun the following to get started: \n\n ${chalk.magentaBright(
    `cd ${path.relative(process.cwd(), absolutePath) || '.'} && ${packageManager}${
      packageManager === 'yarn' ? '' : ' run'
    } dev`,
  )}\n`;
  // eslint-disable-next-line no-console
  console.log(message);
  // eslint-disable-next-line no-console
  console.log();
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
