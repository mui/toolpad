import 'dotenv/config';
import arg from 'arg';
import * as path from 'path';
import { execa } from 'execa';
import { createRequire } from 'module';
import pgConnectionString from 'pg-connection-string';

const args = arg({
  // Types
  '--help': Boolean,
  '--dev': Boolean,
  '--port': Number,
  '--demo': Boolean,
  // Aliases
  '-p': '--port',
});

const DEV_MODE = args['--dev'];
const NEXT_CMD = DEV_MODE ? 'dev' : 'start';

if (!process.env.STUDIO_DATABASE_URL) {
  console.error(`Missing environment variable STUDIO_DATABASE_URL`);
  process.exit(1);
}

const connectionString = pgConnectionString.parse(process.env.STUDIO_DATABASE_URL);
console.log(`Starting Studio with db "${connectionString.host}:${connectionString.port}"`);

const studioDir = path.dirname(
  createRequire(import.meta.url).resolve('@mui/studio-app/package.json'),
);

const port = args['--port'] ?? process.env.PORT ?? 3000;

const cp = execa('yarn', [NEXT_CMD, '--', '--port', String(port)], {
  cwd: studioDir,
  preferLocal: true,
  stdio: 'pipe',
  env: {
    STUDIO_DATABASE_URL: process.env.STUDIO_DATABASE_URL,
    FORCE_COLOR: process.env.FORCE_COLOR,
    PRISMA_HIDE_UPDATE_MESSAGE: '1',
  },
});

process.stdin.pipe(cp.stdin!);
cp.stdout?.pipe(process.stdout);
cp.stderr?.pipe(process.stdout);
