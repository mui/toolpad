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
  '--demo': Boolean,
  // Aliases
  '-p': '--port',
});

function resolveStudioDir({ _: positional = [] }: { _?: string[] }): string {
  const dirArg: string = positional.length > 0 ? positional[0] : '.';
  return dirArg ? path.resolve(process.cwd(), dirArg) : process.cwd();
}

const STUDIO_DIR = resolveStudioDir(args);
const DEV_MODE = args['--dev'];
// const GOOGLE_SHEETS_CLIENT_ID = process.env.STUDIO_DATASOURCE_GOOGLESHEETS_CLIENT_ID;
const NEXT_CMD = DEV_MODE ? 'dev' : 'start';

console.log(`Starting Studio in "${STUDIO_DIR}"`);

const studioDir = path.dirname(
  createRequire(import.meta.url).resolve('@mui/studio-app/package.json'),
);

const port = args['--port'] ?? 3000;

const cp = execa('yarn', [NEXT_CMD, '--', '--port', String(port)], {
  cwd: studioDir,
  preferLocal: true,
  stdio: 'pipe',
  extendEnv: false,
  env: {
    STUDIO_DATABASE_URL: process.env.STUDIO_DATABASE_URL,
    FORCE_COLOR: process.env.FORCE_COLOR,
    STUDIO_DIR,
    DEMO_MODE: String(!!args['--demo']),
  },
});

process.stdin.pipe(cp.stdin!);
cp.stdout?.pipe(process.stdout);
cp.stderr?.pipe(process.stdout);
