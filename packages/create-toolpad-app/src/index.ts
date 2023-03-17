#!/usr/bin/env node

import chalk from 'chalk';
import { execaCommand } from 'execa';
import inquirer from 'inquirer';
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
  const files = await fs.readdir(root);

  if (files.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`The directory ${chalk.green(name)} is non-empty.`);
    // eslint-disable-next-line no-console
    console.log();
    // eslint-disable-next-line no-console
    console.log('Either try using a new directory name, or remove the files listed above.');
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
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')} - Installing dependencies`);

  const installVerb = packageManager === 'yarn' ? 'add' : 'install';
  const command = `${packageManager} ${installVerb} @mui/toolpad @mui/toolpad-core`;
  await execaCommand(command, { stdio: 'inherit', cwd: path.join(cwd, projectName) });

  // eslint-disable-next-line no-console
  console.log(`${chalk.green('success')} - Dependencies installed successfully!`);
};

// Create a new directory and initialize a new project
const scaffoldProject = async (projectName: string, cwd: string): Promise<string | null> => {
  // eslint-disable-next-line no-console
  console.log(`Creating a new MUI Toolpad project in ${chalk.blue(projectName)}`);
  try {
    await fs.mkdir(projectName);
    // process.chdir(projectName);

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
    if (!isFolderEmpty(path.join(cwd, projectName), projectName)) {
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
          )}, ${chalk.magenta('@mui/toolpad-core')}. Do you want to continue?`,
          default: false,
        },
      ]);

      if (installDependenciesConsent.installInExisting) {
        return projectName;
      }
      console.error(`${chalk.red('error')} - Dependencies are required to be installed.`);
      process.exit(1);
    } catch (err) {
      console.error(
        `Unable to create directory ${chalk.red(projectName)}. Please provide a different name.`,
      );
    }
    return null;
  }
};

// Run the CLI interaction with Inquirer.js
const run = async () => {
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
};

run().catch((error) => {
  console.error(`${chalk.red('error')} - ${error.message}`);
  process.exit(1);
});

// Define the questions to be asked during the CLI interaction
