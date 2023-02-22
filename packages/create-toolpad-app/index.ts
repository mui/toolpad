#!/usr/bin/env node

import chalk from 'chalk';
import { execaCommand, execaCommandSync } from 'execa';
import inquirer from 'inquirer';
import fs from 'fs';
import open from 'open';
import { getPackageManager } from './utils/getPackageManager';

// Detect the package manager
const packageManager = getPackageManager();

// Create a new directory and initialize a new project
const scaffoldProject = async (projectName: string) => {
  try {
    fs.mkdirSync(projectName);
  } catch (error) {
    console.error(chalk.red(`Error: Directory ${projectName} already exists`));
    process.exit(1);
  }

  process.chdir(projectName);

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

  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
};

// Install the dependencies
const installDeps = async () => {
  const installVerb = packageManager === 'yarn' ? 'add' : 'install';
  const command = `${packageManager} ${installVerb} @mui/toolpad @mui/toolpad-core`;
  await execaCommand(command, { stdio: 'inherit' });

  // eslint-disable-next-line no-console
  console.log(chalk.green('Dependencies installed successfully!'));
};

const runDevProcess = () => {
  const runVerb = packageManager === 'yarn' ? '' : 'run';
  const command = `${packageManager} ${runVerb} dev`;
  execaCommandSync(command, { stdio: 'inherit', detached: true });
  process.exit(0);
};

// Run the CLI interaction with Inquirer.js
const run = async () => {
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

  await scaffoldProject(name.projectName);
  const installDependenciesConsent = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installDependencies',
      message:
        'The following dependencies will be installed: @mui/toolpad @mui/toolpad-core. Do you want to continue?',
      default: false,
    },
  ]);

  if (installDependenciesConsent.installDependencies) {
    // eslint-disable-next-line no-console
    console.log(`${chalk.blue('Installing dependencies...')}`);
  } else {
    console.error(chalk.red('Error: Dependencies are required for the project'));
    process.exit(1);
  }
  await installDeps();

  const { stdout } = await runDevProcess();

  const url = 'http://localhost:3000';
  // eslint-disable-next-line no-console
  console.log(stdout);
  const message = `Your MUI Toolpad project is ready on ${chalk.green(url)}`;
  // eslint-disable-next-line no-console
  console.log(message);
  open(url);
};

run().catch((error) => {
  console.error(chalk.red(error.message));
  process.exit(1);
});

// Define the questions to be asked during the CLI interaction
