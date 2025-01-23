#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs';
import { input, confirm, select, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import { satisfies } from 'semver';
import invariant from 'invariant';
import type { SupportedAuthProvider } from '@toolpad/core/SignInPage';
import { bashResolvePath } from '@toolpad/utils/cli';
import { downloadAndExtractExample } from './examples';
import type { SupportedFramework, SupportedRouter, GenerateProjectOptions } from './types';
import { findCtaPackageJson, getPackageManager } from './package';
import { scaffoldCoreProject } from './core';
import { scaffoldStudioProject } from './studio';
import { validatePath } from './validation';

declare global {
  interface Error {
    code?: unknown;
  }
}

const run = async () => {
  const pkgJson = await findCtaPackageJson();
  const packageManager = getPackageManager();

  invariant(pkgJson.engines?.node, 'Missing node version in package.json');

  if (!satisfies(process.version, pkgJson.engines.node)) {
    // eslint-disable-next-line no-console
    console.log(
      `${chalk.red('error')} - Your node version ${
        process.version
      } is unsupported. Please upgrade it to at least ${pkgJson.engines.node}`,
    );
    process.exit(1);
  }

  const args = await yargs(process.argv.slice(2))
    .scriptName('create-toolpad-app')
    .usage('$0 [path] [options]')
    .positional('path', {
      type: 'string',
      describe: 'The path where the Toolpad project directory will be created',
    })
    .option('studio', {
      type: 'boolean',
      describe: 'Create a new project with Toolpad Studio',
      default: false,
    })
    .option('install', {
      type: 'boolean',
      describe: 'Install dependencies',
      default: true,
    })
    .option('core-version', {
      type: 'string',
      describe: 'Use a specific version of Toolpad Core',
    })
    .option('example', {
      type: 'string',
      describe:
        'The name of one of the available examples. See https://github.com/mui/toolpad/tree/master/examples.',
    })
    .help().argv;

  const pathArg = args._?.[0] as string;
  const installFlag = args.install as boolean;
  const studioFlag = args.studio as boolean;
  const example = args.example as string;

  if (pathArg) {
    if (!example) {
      const pathValidOrError = await validatePath(pathArg, true);
      if (typeof pathValidOrError === 'string') {
        // eslint-disable-next-line no-console
        console.log();
        // eslint-disable-next-line no-console
        console.log(pathValidOrError);
        // eslint-disable-next-line no-console
        console.log();
        process.exit(1);
      }
    } else {
      await validatePath(pathArg);
    }
  }

  let projectPath = pathArg;
  if (!pathArg) {
    projectPath = await input({
      message: example
        ? `Enter path of directory to download example "${chalk.cyan(example)}" into`
        : 'Enter path of directory to bootstrap new app',
      validate: (pathInput) => validatePath(pathInput, !example),
      default: '.',
    });
  }

  const absolutePath = bashResolvePath(projectPath);

  let hasNodemailerProvider = false;
  let hasPasskeyProvider = false;

  if (example) {
    await downloadAndExtractExample(absolutePath, example);
  } else if (studioFlag) {
    await scaffoldStudioProject(absolutePath, installFlag, packageManager);
  } else {
    const frameworkOption: SupportedFramework = await select({
      message: 'Which framework would you like to use?',
      default: 'nextjs',
      choices: [
        { name: 'Next.js', value: 'nextjs' },
        { name: 'Vite', value: 'vite' },
      ],
    });

    let routerOption: SupportedRouter | undefined;

    if (frameworkOption === 'nextjs') {
      routerOption = await select({
        message: 'Which router would you like to use?',
        default: 'nextjs-app',
        choices: [
          { name: 'Next.js App Router', value: 'nextjs-app' },
          { name: 'Next.js Pages Router', value: 'nextjs-pages' },
        ],
      });
    }

    const authFlag = await confirm({
      message: 'Would you like to enable authentication?',
      default: true,
    });
    let authProviderOptions: SupportedAuthProvider[] = [];
    if (authFlag) {
      authProviderOptions = await checkbox({
        message: 'Select authentication providers to enable:',
        required: true,
        choices:
          frameworkOption === 'nextjs'
            ? [
                { name: 'Google', value: 'google' },
                { name: 'GitHub', value: 'github' },
                { name: 'Passkey', value: 'passkey' },
                { name: 'Magic Link', value: 'nodemailer' },
                { name: 'Credentials', value: 'credentials' },
                { name: 'GitLab', value: 'gitlab' },
                { name: 'Twitter', value: 'twitter' },
                { name: 'Facebook', value: 'facebook' },
                { name: 'Cognito', value: 'cognito' },
                { name: 'Microsoft Entra ID', value: 'microsoft-entra-id' },
                { name: 'Apple', value: 'apple' },
                { name: 'Instagram', value: 'instagram' },
                { name: 'TikTok', value: 'tiktok' },
                { name: 'LinkedIn', value: 'linkedin' },
                { name: 'Slack', value: 'slack' },
                { name: 'Spotify', value: 'spotify' },
                { name: 'Twitch', value: 'twitch' },
                { name: 'Discord', value: 'discord' },
                { name: 'Line', value: 'line' },
                { name: 'Auth0', value: 'auth0' },
                { name: 'Keycloak', value: 'keycloak' },
                { name: 'Okta', value: 'okta' },
                { name: 'FusionAuth', value: 'fusionauth' },
              ]
            : [
                { name: 'Google', value: 'google' },
                { name: 'GitHub', value: 'github' },
                { name: 'Credentials', value: 'credentials' },
              ],
      });
      hasNodemailerProvider = authProviderOptions?.includes('nodemailer');
      hasPasskeyProvider = authProviderOptions?.includes('passkey');
    }

    const options: GenerateProjectOptions = {
      name: path.basename(absolutePath),
      absolutePath,
      coreVersion: args.coreVersion ?? pkgJson.version,
      router: routerOption,
      framework: frameworkOption,
      auth: authFlag,
      install: installFlag,
      authProviders: authProviderOptions,
      hasCredentialsProvider: authProviderOptions?.includes('credentials'),
      hasNodemailerProvider,
      hasPasskeyProvider,
      packageManager,
    };

    await scaffoldCoreProject(options);
  }

  let changeDirectoryInstruction = '';
  if (example) {
    if (!path.relative(process.cwd(), absolutePath)) {
      changeDirectoryInstruction = `  cd ./${example}\n`;
    } else {
      changeDirectoryInstruction = `  cd ${path.basename(absolutePath)}/${example}\n`;
    }
  } else if (path.relative(process.cwd(), absolutePath)) {
    changeDirectoryInstruction = `  cd ${path.relative(process.cwd(), absolutePath)}\n`;
  }

  const installInstruction = example || !installFlag ? `  ${packageManager} install\n` : '';

  const databaseInstruction =
    hasNodemailerProvider || hasPasskeyProvider
      ? `  npx prisma migrate dev --schema=prisma/schema.prisma\n`
      : '';

  const message = `Run the following to get started: \n\n${chalk.magentaBright(
    `${changeDirectoryInstruction}${databaseInstruction}${installInstruction}  ${packageManager}${
      packageManager === 'yarn' ? '' : ' run'
    } dev`,
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
