#!/usr/bin/env node

import * as fs from 'fs/promises';
import { constants as fsConstants } from 'fs';
import path from 'path';
import yargs from 'yargs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { errorFrom } from '@toolpad/utils/errors';
import { execa } from 'execa';
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
  return 'npm';
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
    return `${chalk.red('error')} - The directory at ${chalk.cyan(
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
    `${chalk.cyan('info')} - Creating Toolpad Studio project in ${chalk.cyan(absolutePath)}`,
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
  console.log(`${chalk.cyan('info')} - Initializing package.json file`);
  await fs.writeFile(path.join(absolutePath, 'package.json'), JSON.stringify(packageJson, null, 2));

  // eslint-disable-next-line no-console
  console.log(`${chalk.cyan('info')} - Initializing .gitignore file`);
  await fs.copyFile(
    path.resolve(__dirname, `./gitignoreTemplate`),
    path.join(absolutePath, DEFAULT_GENERATED_GITIGNORE_FILE),
  );

  if (installFlag) {
    // eslint-disable-next-line no-console
    console.log(`${chalk.cyan('info')} - Installing dependencies`);
    // eslint-disable-next-line no-console
    console.log();

    await execa(packageManager, ['install'], { stdio: 'inherit', cwd: absolutePath });

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
    `${chalk.cyan('info')} - Creating Toolpad Core project in ${chalk.cyan(absolutePath)}`,
  );
  // eslint-disable-next-line no-console
  console.log();

  const rootLayoutContent = `  
  import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
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

  const dashboardLayoutContent = `    
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

  const rootPageContent = `
  import Link from "next/link";
  import { Button, Container, Typography, Box } from "@mui/material";

  export default function Home() {
    return (
      <Container>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to{" "}
            <Link href="https://mui.com/toolpad/core/introduction">
              Toolpad Core!
            </Link>
          </Typography>

          <Typography variant="body1">
            Get started by editing <code>(dashboard)/page/page.tsx</code>
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Link href="/page">
              <Button variant="contained" color="primary">
                Go to Page
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    );
  }
  `;

  const dashboardPageContent = `
  import { Typography, Container } from "@mui/material";
  export default function Home() {
    return (
      <main>
        <Container sx={{ mx: 4 }}>
          <Typography variant="h6" color="grey.800">
            Dashboard content!
          </Typography>
        </Container>
      </main>
    );
  }
  `;

  const themeContent = `
  "use client"
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

  const eslintConfigContent = `{    
    "extends": "next/core-web-vitals"        
  }
  `;

  const nextTypesContent = `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
  `;

  const nextConfigContent = `
  /** @type {import('next').NextConfig} */
  const nextConfig = {};
  export default nextConfig;
  `;

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
      next: '^14',
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
      'eslint-config-next': '^14',
    },
  };

  const gitignoreTemplate = `
  # Logs
  logs
  *.log
  npm-debug.log*
  yarn-debug.log*
  yarn-error.log*
  lerna-debug.log*
  .pnpm-debug.log*
  
  # Diagnostic reports (https://nodejs.org/api/report.html)
  report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json
  
  # Runtime data
  pids
  *.pid
  *.seed
  *.pid.lock
  
  # Directory for instrumented libs generated by jscoverage/JSCover
  lib-cov
  
  # Coverage directory used by tools like istanbul
  coverage
  *.lcov
  
  # nyc test coverage
  .nyc_output
  
  # Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
  .grunt
  
  # Bower dependency directory (https://bower.io/)
  bower_components
  
  # node-waf configuration
  .lock-wscript
  
  # Compiled binary addons (https://nodejs.org/api/addons.html)
  build/Release
  
  # Dependency directories
  node_modules/
  jspm_packages/
  
  # Snowpack dependency directory (https://snowpack.dev/)
  web_modules/
  
  # TypeScript cache
  *.tsbuildinfo
  
  # Optional npm cache directory
  .npm
  
  # Optional eslint cache
  .eslintcache
  
  # Optional stylelint cache
  .stylelintcache
  
  # Microbundle cache
  .rpt2_cache/
  .rts2_cache_cjs/
  .rts2_cache_es/
  .rts2_cache_umd/
  
  # Optional REPL history
  .node_repl_history
  
  # Output of 'npm pack'
  *.tgz
  
  # Yarn Integrity file
  .yarn-integrity
  
  # dotenv environment variable files
  .env
  .env.development.local
  .env.test.local
  .env.production.local
  .env.local
  
  # parcel-bundler cache (https://parceljs.org/)
  .cache
  .parcel-cache
  
  # Next.js build output
  .next
  out
  
  # Nuxt.js build / generate output
  .nuxt
  dist
  
  # Gatsby files
  .cache/
  # Comment in the public line in if your project uses Gatsby and not Next.js
  # https://nextjs.org/blog/next-9-1#public-directory-support
  # public
  
  # vuepress build output
  .vuepress/dist
  
  # vuepress v2.x temp and cache directory
  .temp
  .cache
  
  # Docusaurus cache and generated files
  .docusaurus
  
  # Serverless directories
  .serverless/
  
  # FuseBox cache
  .fusebox/
  
  # DynamoDB Local files
  .dynamodb/
  
  # TernJS port file
  .tern-port
  
  # Stores VSCode versions used for testing VSCode extensions
  .vscode-test
  
  # yarn v2
  .yarn/cache
  .yarn/unplugged
  .yarn/build-state.yml
  .yarn/install-state.gz
  `;

  // Define all files to be created up front
  const files = new Map([
    ['app/api/auth/[...nextAuth]/route.ts', { content: '' }],
    ['app/auth/[...path]/page.tsx', { content: '' }],
    ['app/(dashboard)/page/page.tsx', { content: dashboardPageContent }],
    ['app/(dashboard)/layout.tsx', { content: dashboardLayoutContent }],
    ['app/layout.tsx', { content: rootLayoutContent }],
    ['app/page.tsx', { content: rootPageContent }],
    ['theme.ts', { content: themeContent }],
    ['next-env.d.ts', { content: nextTypesContent }],
    ['next.config.mjs', { content: nextConfigContent }],
    ['.eslintrc.json', { content: eslintConfigContent }],
    ['tsconfig.json', { content: tsConfigContent }],
    ['package.json', { content: JSON.stringify(packageJson, null, 2) }],
    ['.gitignore', { content: gitignoreTemplate }],
    // ...
  ]);

  // Get all directories and deduplicate
  const dirs = new Set(Array.from(files.keys(), (filePath) => path.dirname(filePath)));

  // Create directories, use recursive option to create parent directories
  try {
    await Promise.all(
      Array.from(dirs, (dirPath) =>
        fs.mkdir(path.join(absolutePath, dirPath), { recursive: true }),
      ),
    );
  } catch (error: any) {
    // error.code === 'EEXIST' means the directory already exists, this is fine.
    const maybeError: Error = error;
    if (maybeError?.code !== 'EEXIST') {
      throw error;
    }
  }

  // Write all the files
  await Promise.all(
    Array.from(files.entries(), ([filePath, { content }]) =>
      fs.writeFile(path.join(absolutePath, filePath), content),
    ),
  );

  // eslint-disable-next-line no-console
  console.log(`${chalk.cyan('info')} - Installing dependencies`);
  // eslint-disable-next-line no-console
  console.log();

  await execa(packageManager, ['install'], { stdio: 'inherit', cwd: absolutePath });

  // eslint-disable-next-line no-console
  console.log();
  // eslint-disable-next-line no-console
  console.log(
    `${chalk.green('success')} - Created Toolpad Core project at ${chalk.cyan(absolutePath)}`,
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
