#!/usr/bin/env node

import * as fs from 'fs/promises';
import path from 'path';

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

async function isFolderEmpty(root: string, name: string): Promise<boolean> {
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

  const conflicts = await fs.readdir(root);

  conflicts
    .filter((file) => !validFiles.includes(file))
    // Support IntelliJ IDEA-based editors
    .filter((file) => !/\.iml$/.test(file));

  if (conflicts.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`The directory ${chalk.green(name)} contains files that could conflict:`);
    // eslint-disable-next-line no-console
    console.log();
    for (const file of conflicts) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const stats = await fs.lstat(path.join(root, file));
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
const installDeps = async (projectName: string, cwd: string) => {
  const { execaCommand } = await import('execa');
  const { default: chalk } = await import('chalk');
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')} - Installing dependencies`);
  // eslint-disable-next-line no-console
  console.log();

  const installVerb = packageManager === 'yarn' ? 'add' : 'install';
  const command = `${packageManager} ${installVerb} @mui/toolpad`;
  await execaCommand(command, { stdio: 'inherit', cwd: path.join(cwd, projectName) });

  // eslint-disable-next-line no-console
  console.log(`${chalk.green('success')} - Dependencies installed successfully!`);
  // eslint-disable-next-line no-console
  console.log();
};

// Create a new directory and initialize a new project
const scaffoldProject = async (projectName: string, cwd: string): Promise<string | null> => {
  const { default: chalk } = await import('chalk');
  const { default: inquirer } = await import('inquirer');
  // eslint-disable-next-line no-console
  console.log(`Creating a new MUI Toolpad project in ${chalk.blue(projectName)}`);
  // eslint-disable-next-line no-console
  console.log();
  try {
    await fs.mkdir(projectName);

    const packageJson = {
      name: projectName,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'toolpad dev',
        build: 'toolpad build',
        start: 'toolpad start',
      },
    };

    await fs.writeFile(`./${projectName}/package.json`, JSON.stringify(packageJson, null, 2));
    return projectName;
  } catch (error) {
    // Directory exists, verify if it is empty to continue
    if (!(await isFolderEmpty(path.join(cwd, projectName), projectName))) {
      // eslint-disable-next-line no-console
      console.log('Either try using a new directory name, or remove the files listed above.');
      // eslint-disable-next-line no-console
      console.log();
      return null;
    }
    try {
      await fs.access(projectName);

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
        return projectName;
      }
      console.error(`${chalk.red('error')} - Dependencies are required to be installed.`);
      // eslint-disable-next-line no-console
      console.log();
      process.exit(1);
    } catch (err) {
      console.error(
        `Unable to create directory ${chalk.red(projectName)}. Please provide a different name.`,
      );
      // eslint-disable-next-line no-console
      console.log();
    }
    return null;
  }
};

// Run the CLI interaction with Inquirer.js
const run = async () => {
  const { default: chalk } = await import('chalk');
  const { default: inquirer } = await import('inquirer');
  let projectName;
  const cwd = process.cwd();
  do {
    // eslint-disable-next-line no-await-in-loop
    const name = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Enter the name of your project:',
        default: 'my-toolpad-app',
      },
    ]);

    // eslint-disable-next-line no-await-in-loop
    projectName = await scaffoldProject(name.projectName, cwd);
  } while (!projectName);

  await installDeps(projectName, cwd);

  const message = `\nRun the following to get started: \n\n ${chalk.magentaBright(
    `cd ${projectName} && ${packageManager}${packageManager === 'yarn' ? '' : ' run'} dev`,
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

// Define the questions to be asked during the CLI interaction
