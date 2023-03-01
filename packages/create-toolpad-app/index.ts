#!/usr/bin/env node

import chalk from 'chalk';
import { execaCommand } from 'execa';
import inquirer from 'inquirer';
import fs from 'fs';
import { getPackageManager } from './utils/getPackageManager';

// Detect the package manager
const packageManager = getPackageManager();

// Create a new directory and initialize a new project
const scaffoldProject = async () => {
  const name = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter the name of your project:',
      default: 'my-app',
    },
  ]);

  // eslint-disable-next-line no-console
  console.log(`Creating a new MUI Toolpad project in ${chalk.blue(name.projectName)}`);
  try {
    fs.mkdirSync(name.projectName);
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

    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    return name.projectName;
  } catch (error) {
    if (fs.existsSync(name.projectName)) {
      console.error(
        `Directory ${chalk.red(name.projectName)} already exists. Please provide a different name.`,
      );
    }
    return null;
  }
};

// Install the dependencies
const installDeps = async () => {
  const installVerb = packageManager === 'yarn' ? 'add' : 'install';
  const command = `${packageManager} ${installVerb} @mui/toolpad @mui/toolpad-core`;
  await execaCommand(command, { stdio: 'inherit' });

  // eslint-disable-next-line no-console
  console.log(chalk.green('Dependencies installed successfully!'));
};

// Run the CLI interaction with Inquirer.js
const run = async () => {
  let projectName;
  do {
    // eslint-disable-next-line no-await-in-loop
    projectName = await scaffoldProject();
  } while (!projectName);

  const installDependenciesConsent = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installDependencies',
      message: `The following dependencies will be installed: ${chalk.magentaBright(
        '@mui/toolpad',
      )}, ${chalk.magenta('@mui/toolpad-core')}. Do you want to continue?`,
      default: false,
    },
  ]);

  if (installDependenciesConsent.installDependencies) {
    // eslint-disable-next-line no-console
    console.log(`${chalk.blue('Installing dependencies...')}`);
  } else {
    console.error(
      `Dependencies are required. Deleting directory ${chalk.red(projectName)} and exiting.`,
    );
    process.chdir('..');
    try {
      await execaCommand(`rm -rf ${projectName}`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`${chalk.red('error')} - Unable to delete directory ${projectName}: ${error}`);
    }

    process.exit(1);
  }
  await installDeps();

  const message = `\nRun the following to get started: \n\n ${chalk.magentaBright(
    `cd ${projectName}`,
  )}\n ${chalk.magentaBright(`${packageManager}${packageManager === 'yarn' ? '' : ' run'} dev`)}`;
  // eslint-disable-next-line no-console
  console.log(message);
};

run().catch((error) => {
  console.error(chalk.red(error.message));
  process.exit(1);
});

// Define the questions to be asked during the CLI interaction
