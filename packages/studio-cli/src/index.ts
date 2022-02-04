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

function resolveStudioDir({ _: positional = [] }: { _?: string[] }): string {
  const dirArg: string = positional.length > 0 ? positional[0] : '.';
  return dirArg ? path.resolve(process.cwd(), dirArg) : process.cwd();
}

const STUDIO_DIR = resolveStudioDir(args);
const DEV_MODE = args['--dev'];
const NEXT_CMD = DEV_MODE ? 'dev' : 'start';

console.log(`Starting Studio in "${STUDIO_DIR}"`);

const studioDir = path.dirname(
  createRequire(import.meta.url).resolve('@mui/studio-app/package.json'),
);

const port = args['--port'] ?? 3000;

const cp = execa('next', [NEXT_CMD, '--port', String(port)], {
  cwd: studioDir,
  preferLocal: true,
  stdio: 'pipe',
  extendEnv: false,
  env: {
    FORCE_COLOR: process.env.FORCE_COLOR,
    STUDIO_DIR,
  },
});

process.stdin.pipe(cp.stdin!);
cp.stdout?.pipe(process.stdout);
cp.stderr?.pipe(process.stdout);
