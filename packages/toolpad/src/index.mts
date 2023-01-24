import 'dotenv/config';
import arg from 'arg';
import * as path from 'path';
import { execa } from 'execa';
import { createRequire } from 'module';

interface DevCommandArgs {
  // Toolpad port
  port?: number;
  // Whether Toolpad editor is running in dev mode (for debugging purposes only)
  devMode?: boolean;
}

function devCommand({ devMode = false, port = 3000 }: DevCommandArgs) {
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
      FORCE_COLOR: '1',
    },
  });

  process.stdin.pipe(cp.stdin!);
  cp.stdout?.pipe(process.stdout);
  cp.stderr?.pipe(process.stdout);
}

function buildCommand() {
  throw new Error('Not implemented');
}

function startCommand() {
  throw new Error('Not implemented');
}

export default function cli(argv: string[]) {
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

  switch (command) {
    case undefined:
    case 'dev':
      devCommand({
        devMode: args['--dev'],
        port: args['--port'],
      });
      break;
    case 'build':
      buildCommand();
      break;
    case 'start':
      startCommand();
      break;
    default:
      throw new Error(`Unknown command "${command}"`);
  }
}
