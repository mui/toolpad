import 'dotenv/config';
import arg from 'arg';
import * as path from 'path';
import { execa } from 'execa';
import { createRequire } from 'module';

const args = arg({
  // Types
  '--help': Boolean,
  '--dev': Boolean,
  '--port': Number,
  // Aliases
  '-p': '--port',
});

const DEV_MODE = args['--dev'];
const NEXT_CMD = DEV_MODE ? 'local:dev' : 'local:start';

const toolpadDir = path.dirname(
  createRequire(import.meta.url).resolve('@mui/toolpad-app/package.json'),
);

const port = args['--port'] ?? 3000;

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
