#!/usr/bin/env node

import chalk from 'chalk';
import { execaCommand } from 'execa';
import inquirer from 'inquirer';
import * as fs from 'fs/promises';
import path from 'path';
import { getPackageManager } from './utils/getPackageManager';
import { isFolderEmpty } from './utils/isFolderEmpty';
// Detect the package manager
const packageManager = getPackageManager();

// Install the dependencies
const installDeps = async () => {
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')} - Installing dependencies`);

  const installVerb = packageManager === 'yarn' ? 'add' : 'install';
  const command = `${packageManager} ${installVerb} @mui/toolpad @mui/toolpad-core`;
  await execaCommand(command, { stdio: 'inherit' });

  // eslint-disable-next-line no-console
  console.log(`${chalk.green('success')} - Dependencies installed successfully!`);
};

// Create a new directory and initialize a new project
const scaffoldProject = async () => {
  const name = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter the name of your project:',
      default: 'my-toolpad-app',
    },
  ]);

  // eslint-disable-next-line no-console
  console.log(`Creating a new MUI Toolpad project in ${chalk.blue(name.projectName)}`);
  try {
    await fs.mkdir(name.projectName);
    process.chdir(name.projectName);

    const packageJson = {
      name: name.projectName,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'toolpad dev',
        build: 'toolpad build',
        start: 'toolpad start',
      },
    };

    await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
    return name.projectName;
  } catch (error) {
    // Directory exists, verify if it is empty to continue
    if (!isFolderEmpty(path.join(process.cwd(), name.projectName), name.projectName)) {
      return null;
    }
    try {
      await fs.access(name.projectName);
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
        return name.projectName;
      }
      console.error(`${chalk.red('error')} - Dependencies are required to be installed.`);
      process.exit(1);
    } catch (err) {
      console.error(
        `Unable to create directory ${chalk.red(
          name.projectName,
        )}. Please provide a different name.`,
      );
    }
    return null;
  }
};

// Run the CLI interaction with Inquirer.js
const run = async () => {
  let projectName;
  do {
    // eslint-disable-next-line no-await-in-loop
    projectName = await scaffoldProject();
  } while (!projectName);

  await installDeps();

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
