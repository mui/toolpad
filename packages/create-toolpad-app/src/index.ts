#!/usr/bin/env node

import * as fs from 'fs/promises';
import { constants as fsConstants } from 'fs';
import path from 'path';
import yargs from 'yargs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { errorFrom } from '@toolpad/utils/errors';
import { execaCommand } from 'execa';
import { satisfies } from 'semver';
import { readJsonFile } from '@toolpad/utils/fs';
import invariant from 'invariant';
import { bashResolvePath } from '@toolpad/utils/cli';
import { PackageJson } from './packageType';
import { downloadAndExtractExample } from './examples';

type PackageManager = 'npm' | 'pnpm' | 'yarn';
declare global {
  interface Error {
    code?: unknown;
  }
}

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
  return 'pnpm';
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
  const absolutePath = path.join(process.cwd(), relativePath);

  try {
    await fs.access(absolutePath, fsConstants.F_OK);

    // Directory exists, verify if it's empty to proceed
    if (await isFolderEmpty(absolutePath)) {
      return true;
    }
    return `${chalk.red('error')} - The directory at ${chalk.blue(
      absolutePath,
    )} contains files that could conflict. Either use a new directory, or remove conflicting files.`;
  } catch (rawError: unknown) {
    // Directory does not exist, create it
    const error = errorFrom(rawError);
    if (error.code === 'ENOENT') {
      await fs.mkdir(absolutePath, { recursive: true });
      return true;
    }
    // Unexpected error, let it bubble up and crash the process
    throw error;
  }
};

// Create a new `package.json` file and install dependencies
const scaffoldProject = async (absolutePath: string, installFlag: boolean): Promise<void> => {
  // eslint-disable-next-line no-console
  console.log();
  // eslint-disable-next-line no-console
  console.log(
    `${chalk.blue('info')} - Creating Toolpad Studio project in ${chalk.blue(absolutePath)}`,
  );
  // eslint-disable-next-line no-console
  console.log();

  const packageJson: PackageJson = {
    name: path.basename(absolutePath),
    version: '0.1.0',
    scripts: {
      dev: 'toolpad-studio dev',
      build: 'toolpad-studio build',
      start: 'toolpad-studio start',
    },
    dependencies: {
      '@toolpad/studio': 'latest',
    },
  };

  const DEFAULT_GENERATED_GITIGNORE_FILE = '.gitignore';
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')} - Initializing package.json file`);
  await fs.writeFile(path.join(absolutePath, 'package.json'), JSON.stringify(packageJson, null, 2));

  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')} - Initializing .gitignore file`);
  await fs.copyFile(
    path.resolve(__dirname, `./gitignoreTemplate`),
    path.join(absolutePath, DEFAULT_GENERATED_GITIGNORE_FILE),
  );

  if (installFlag) {
    // eslint-disable-next-line no-console
    console.log(`${chalk.blue('info')} - Installing dependencies`);
    // eslint-disable-next-line no-console
    console.log();

    const installVerb = packageManager === 'yarn' ? 'add' : 'install';
    const command = `${packageManager} ${installVerb} @toolpad/studio`;
    await execaCommand(command, { stdio: 'inherit', cwd: absolutePath });

    // eslint-disable-next-line no-console
    console.log();
    // eslint-disable-next-line no-console
    console.log(`${chalk.green('success')} - Dependencies installed successfully!`);
    // eslint-disable-next-line no-console
    console.log();
  }
};

const scaffoldCoreProject = async (absolutePath: string): Promise<void> => {
  // eslint-disable-next-line no-console
  console.log();
  // eslint-disable-next-line no-console
  console.log(
    `${chalk.blue('info')} - Creating Toolpad Core project in ${chalk.blue(absolutePath)}`,
  );
  // eslint-disable-next-line no-console
  console.log();

  const packageJson: PackageJson = {
    name: path.basename(absolutePath),
    version: '0.1.0',
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
    },
    dependencies: {
      react: '^18',
      'react-dom': '^18',
      next: '14.1.3',
      '@mui/material': '^5',
      '@mui/icons-material': '^5',
      '@emotion/react': '^11',
      '@emotion/styled': '^11',
      '@mui/material-nextjs': '^5',
      '@emotion/cache': '^11',
    },
    devDependencies: {
      typescript: '^5',
      '@types/node': '^20',
      '@types/react': '^18',
      '@types/react-dom': '^18',
      eslint: '^8',
      'eslint-config-next': '14.1.3',
    },
  };

  const DEFAULT_GENERATED_GITIGNORE_FILE = '.gitignore';

  await fs.writeFile(path.join(absolutePath, 'package.json'), JSON.stringify(packageJson, null, 2));

  await fs.copyFile(
    path.resolve(__dirname, `./gitignoreTemplate`),
    path.join(absolutePath, DEFAULT_GENERATED_GITIGNORE_FILE),
  );

  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')} - Installing dependencies`);
  // eslint-disable-next-line no-console
  console.log();

  const installVerb = 'install';
  const command = `${packageManager} ${installVerb}`;
  await execaCommand(command, { stdio: 'inherit', cwd: absolutePath });

  // Create the `app` directory
  await fs.mkdir(path.join(absolutePath, 'app'));
  // Create the `api` directory inside the `app` directory
  await fs.mkdir(path.join(absolutePath, 'app', 'api'));
  // Create the `auth` directory inside the `api` directory
  await fs.mkdir(path.join(absolutePath, 'app', 'api', 'auth'));
  // Create the `[...nextAuth]` directory inside the `auth` directory
  await fs.mkdir(path.join(absolutePath, 'app', 'api', 'auth', '[...nextAuth]'));
  // Create the `route.ts` file inside the `[...nextAuth]` directory
  await fs.writeFile(
    path.join(absolutePath, 'app', 'api', 'auth', '[...nextAuth]', 'route.ts'),
    '',
  );
  // Create the `auth` directory inside the `app` directory
  await fs.mkdir(path.join(absolutePath, 'app', 'auth'));
  // Create the `[...path]` directory inside the `auth` directory
  await fs.mkdir(path.join(absolutePath, 'app', 'auth', '[...path]'));
  // Create the `page.tsx` file inside the `[...path]` directory
  await fs.writeFile(path.join(absolutePath, 'app', 'auth', '[...path]', 'page.tsx'), '');
  // Create the `(dashboard)` directory inside the `app` directory
  await fs.mkdir(path.join(absolutePath, 'app', '(dashboard)'));
  // Create the `page` directory inside the `(dashboard)` directory
  await fs.mkdir(path.join(absolutePath, 'app', '(dashboard)', 'page'));
  const pageContent = `
  import { Typography } from "@mui/material";

  export default function Home() {
    return (
      <main>
        <div>
          <Typography variant="h6" color="grey.800">
            Customize <code>page.tsx</code> to begin.
          </Typography>
        </div>
      </main>
    );
  }
  `;
  // Create the `page.tsx` file inside the `page` directory
  await fs.writeFile(
    path.join(absolutePath, 'app', '(dashboard)', 'page', 'page.tsx'),
    pageContent,
  );

  const dashboardLayoutContent = `
  import * as React from "react";
  import {
    AppBar,
    Badge,
    Box,
    Container,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    Toolbar,
  } from "@mui/material";

  import HomeIcon from "@mui/icons-material/Home";
  import SettingsIcon from "@mui/icons-material/Settings";
  import NotificationsIcon from "@mui/icons-material/Notifications";

  export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
      <Box sx={{ display: "flex" }}>
        <AppBar position="absolute">
          <Toolbar sx={{ justifyContent: "flex-end" }}>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" anchor="left">
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          ></Toolbar>
          <Divider />
          <List component="nav">
            <ListItemButton>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
            </ListItemButton>
          </List>
        </Drawer>
        <Box
          component={"main"}
          sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}
        >
          <Toolbar />
          <Container maxWidth="lg">{children}</Container>
        </Box>
      </Box>
    );
  }
`;
  // Create the `layout.tsx` file inside the `(dashboard)` directory
  await fs.writeFile(
    path.join(absolutePath, 'app', '(dashboard)', 'layout.tsx'),
    dashboardLayoutContent,
  );

  const rootLayoutContent = `
  import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
  import { ThemeProvider } from '@mui/material/styles';
  import theme from '../theme';
  
  
    export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {      
      return (
        <html lang="en">
          <body>
            <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
                {children}
              </ThemeProvider>
            </AppRouterCacheProvider>
          </body>
        </html>
      );
    }
    `;
  // Write the content of the `layout.tsx` file
  await fs.writeFile(path.join(absolutePath, 'app', 'layout.tsx'), rootLayoutContent);

  const themeContent = `    
  "use client";
  import { Roboto } from "next/font/google";
  import { createTheme } from "@mui/material/styles";
  
  const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
  });
  
  const theme = createTheme({
    typography: {
      fontFamily: roboto.style.fontFamily,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none",
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            padding: 0,
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: "28px",
          },
        },
      },
    },
  });
  
  export default theme;
  `;

  // Create the `theme.ts` file in the root directory
  await fs.writeFile(path.join(absolutePath, 'theme.ts'), themeContent);

  const nextTypes = `/// <reference types="next" />
  /// <reference types="next/image-types/global" />
  
  // NOTE: This file should not be edited
  // see https://nextjs.org/docs/basic-features/typescript for more information.
  `;
  // Create the `next-env.d.ts` file in the root directory
  await fs.writeFile(path.join(absolutePath, 'next-env.d.ts'), nextTypes);

  const nextConfigContent = `
  /** @type {import('next').NextConfig} */
  const nextConfig = {  
    async redirects() {
      return [
        {
          source: '/',
          destination: '/page',
          permanent: true,
        },
      ]
    },  
  };
  export default nextConfig;
  `;
  // Create the `next.config.mjs` file in the root directory
  await fs.writeFile(path.join(absolutePath, 'next.config.mjs'), nextConfigContent);

  const eslintConfigContent = `{    
      "extends": "next/core-web-vitals"        
  }
  `;
  // Create the `.eslintrc.json` file in the root directory
  await fs.writeFile(path.join(absolutePath, '.eslintrc.json'), eslintConfigContent);

  const tsConfigContent = `{
    "compilerOptions": {
      "lib": ["dom", "dom.iterable", "esnext"],
      "allowJs": true,
      "skipLibCheck": true,
      "strict": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "bundler",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "incremental": true,
      "plugins": [
        {
          "name": "next"
        }
      ],
      "paths": {
        "@/*": ["./*"]
      }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules"]
  }
  `;
  // Create the `tsconfig.json` file in the root directory
  await fs.writeFile(path.join(absolutePath, 'tsconfig.json'), tsConfigContent);

  // eslint-disable-next-line no-console
  console.log();
  // eslint-disable-next-line no-console
  console.log(
    `${chalk.green('success')} - Created Toolpad Core project at ${chalk.blue(absolutePath)}`,
  );
  // eslint-disable-next-line no-console
  console.log();
};

// Run the CLI interaction with Inquirer.js
const run = async () => {
  const pkgJson: PackageJson = (await readJsonFile(
    path.resolve(__dirname, `../package.json`),
  )) as any;

  invariant(pkgJson.engines?.node, 'Missing node version in package.json');

  // check the node version before create
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
      describe: 'The path where the Toolpad Studio project directory will be created',
    })
    .option('core', {
      type: 'boolean',
      describe: 'Create a new project with Toolpad Core',
      default: false,
    })
    .option('install', {
      type: 'boolean',
      describe: 'Install dependencies',
      default: true,
    })
    .option('example', {
      type: 'string',
      describe:
        'The name of one of the available examples. See https://github.com/mui/mui-toolpad/tree/master/examples.',
    })
    .help().argv;

  const pathArg = args._?.[0] as string;
  const installFlag = args.install as boolean;
  const coreFlag = args.core as boolean;

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

  const absolutePath = bashResolvePath(answers.path || pathArg);

  if (args.example) {
    await downloadAndExtractExample(absolutePath, args.example);
  } else if (coreFlag) {
    await scaffoldCoreProject(absolutePath);
  } else {
    await scaffoldProject(absolutePath, installFlag);
  }

  const changeDirectoryInstruction =
    /* `path.relative` is truth-y if the relative path
     * between `absolutePath` and `process.cwd()`
     * is not empty
     */
    path.relative(process.cwd(), absolutePath)
      ? `  cd ${path.relative(process.cwd(), absolutePath)}\n`
      : '';

  const installInstruction = installFlag ? '' : `  ${packageManager} install\n`;

  const message = `Run the following to get started: \n\n${chalk.magentaBright(
    `${changeDirectoryInstruction}${installInstruction}  ${packageManager}${
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
