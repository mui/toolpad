import 'dotenv/config';
import arg from 'arg';
import * as path from 'path';
import { execa } from 'execa';
import { createRequire } from 'module';

interface RunCommandArgs {
  // Toolpad port
  port?: number;
  // Whether Toolpad editor is running in dev mode (for debugging purposes only)
  devMode?: boolean;
}

async function runApp(cmd: 'dev' | 'start', { devMode = false, port = 3000 }: RunCommandArgs) {
  const NEXT_CMD = devMode ? 'local:dev' : 'local:start';

  const toolpadDir = path.dirname(
    createRequire(import.meta.url).resolve('@mui/toolpad-app/package.json'),
  );

  const cp = execa('yarn', [NEXT_CMD, '--', '--port', String(port)], {
    cwd: toolpadDir,
    preferLocal: true,
    stdio: 'pipe',
    env: {
      TOOLPAD_PROJECT_DIR: process.cwd(),
      TOOLPAD_CMD: cmd,
      FORCE_COLOR: '1',
    },
  });

  process.stdin.pipe(cp.stdin!);
  cp.stdout?.pipe(process.stdout);
  cp.stderr?.pipe(process.stdout);
}

async function devCommand(args: RunCommandArgs) {
  // eslint-disable-next-line no-console
  console.log('starting toolpad application in dev mode...');
  await runApp('dev', args);
}

async function buildCommand() {
  // eslint-disable-next-line no-console
  console.log('building toolpad application...');
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
  // eslint-disable-next-line no-console
  console.log('done.');
}

async function startCommand(args: RunCommandArgs) {
  // eslint-disable-next-line no-console
  console.log('starting toolpad application...');
  await runApp('start', args);
}

export default async function cli(argv: string[]) {
  const args = arg(
    {
      // Types
      '--help': Boolean,
      '--dev': Boolean,
      '--port': Number,
      // Aliases
      '-p': '--port',
    },
    {
      argv,
    },
  );

  const command = args._[0];

  const runArgs = {
    devMode: args['--dev'],
    port: args['--port'],
  };

  switch (command) {
    case undefined:
    case 'dev':
      await devCommand(runArgs);
      break;
    case 'build':
      await buildCommand();
      break;
    case 'start':
      await startCommand(runArgs);
      break;
    default:
      throw new Error(`Unknown command "${command}"`);
  }
}
