import 'dotenv/config';
import yargs from 'yargs';
import path from 'path';
import openBrowser from 'react-dev-utils/openBrowser';
import chalk from 'chalk';
import { folderExists } from '@mui/toolpad-utils/fs';
import { execaNode } from 'execa';
import getPort from 'get-port';
import { Worker } from 'worker_threads';
import { ServerConfig } from './server';

const DEFAULT_PORT = 3000;

function* getPreferredPorts(port: number = DEFAULT_PORT): Iterable<number> {
  while (true) {
    yield port;
    port += 1;
  }
}

type Command = 'dev' | 'start' | 'build';
interface RunOptions {
  dir: string;
  port?: number;
  dev?: boolean;
}

async function runApp(cmd: Command, { port, dev = false, dir }: RunOptions) {
  const projectDir = path.resolve(process.cwd(), dir);

  if (!(await folderExists(projectDir))) {
    console.error(`${chalk.red('error')} - No project found at ${chalk.cyan(`"${projectDir}"`)}`);
    process.exit(1);
  }

  if (!port) {
    port = cmd === 'dev' ? await getPort({ port: getPreferredPorts(DEFAULT_PORT) }) : DEFAULT_PORT;
  } else {
    // if port is specified but is not available, exit
    const availablePort = await getPort({ port });
    if (availablePort !== port) {
      console.error(`${chalk.red('error')} - Port ${port} is not available. Aborted.`);
      process.exit(1);
    }
  }

  const editorDevMode =
    !!process.env.TOOLPAD_NEXT_DEV || process.env.NODE_ENV === 'development' || dev;

  const serverPath = path.resolve(__dirname, './server.js');

  const externalUrl = process.env.TOOLPAD_EXTERNAL_URL || `http://localhost:${port}`;

  const worker = new Worker(serverPath, {
    workerData: {
      cmd,
      gitSha1: process.env.GIT_SHA1 || null,
      circleBuildNum: process.env.CIRCLE_BUILD_NUM || null,
      projectDir,
      port,
      devMode: editorDevMode,
      externalUrl,
    } satisfies ServerConfig,
    env: {
      ...process.env,
      // TODO: eliminate the need for TOOLPAD_PROJECT_DIR and remove the worker altogether
      TOOLPAD_PROJECT_DIR: projectDir,
    },
  });

  const serverPort = await new Promise<void>((resolve) => {
    worker.on('message', (msg: any) => {
      if (msg.kind === 'ready') {
        resolve(msg.port);
      }
    });
  });

  const toolpadBaseUrl = `http://localhost:${serverPort}/`;

  // eslint-disable-next-line no-console
  console.log(
    `${chalk.green('ready')} - toolpad project ${chalk.cyan(projectDir)} ready on ${chalk.cyan(
      toolpadBaseUrl,
    )}`,
  );

  if (cmd === 'dev') {
    try {
      openBrowser(toolpadBaseUrl);
    } catch (err: any) {
      console.error(`${chalk.red('error')} - Failed to open browser: ${err.message}`);
    }
  }

  worker.on('exit', (code) => {
    if (code) {
      process.exit(code);
    }
  });
}

async function devCommand(args: RunOptions) {
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - starting Toolpad application in dev mode...`);
  await runApp('dev', args);
}

interface BuildOptions {
  dir: string;
}

async function buildCommand({ dir }: BuildOptions) {
  const projectDir = path.resolve(process.cwd(), dir);
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - building Toolpad application...`);

  const builderPath = path.resolve(__dirname, './appBuilder.js');

  await execaNode(builderPath, [], {
    cwd: projectDir,
    stdio: 'inherit',
    env: {
      NODE_ENV: 'production',
      TOOLPAD_PROJECT_DIR: projectDir,
      FORCE_COLOR: '1',
    },
  });

  // eslint-disable-next-line no-console
  console.log(`${chalk.green('success')} - build done.`);
}

async function startCommand(args: RunOptions) {
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue('info')}  - Starting Toolpad application...`);
  await runApp('start', args);
}

export default async function cli(argv: string[]) {
  const sharedOptions = {
    dir: {
      type: 'string',
      describe: 'Directory of the Toolpad application',
      default: '.',
    },
  } as const;

  const sharedRunOptions = {
    ...sharedOptions,
    port: {
      type: 'number',
      describe: 'Port to run the Toolpad application on',
      demandOption: false,
    },
    dev: {
      type: 'boolean',
      describe: 'Run the Toolpad editor app in development mode',
      demandOption: false,
      default: false,
      hidden: true,
    },
  } as const;

  const parsedArgs = yargs(argv)
    // See https://github.com/yargs/yargs/issues/538
    .scriptName('toolpad')
    .command(
      ['$0 [dir]', 'dev [dir]'],
      'Run Toolpad in development mode',
      {
        ...sharedRunOptions,
      },
      (args) => devCommand(args),
    )
    .command(
      'start [dir]',
      'Run built Toolpad application in production mode',
      {
        ...sharedRunOptions,
      },
      (args) => startCommand(args),
    )
    .command(
      'build [dir]',
      'Build Toolpad app for production',
      {
        ...sharedOptions,
      },
      (args) => buildCommand(args),
    )
    .command('help', 'Show help', {}, async () => {
      // eslint-disable-next-line no-console
      console.log(await parsedArgs.getHelp());
    })
    .help();

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  parsedArgs.argv;
}
