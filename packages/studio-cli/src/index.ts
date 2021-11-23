import arg from 'arg';
import * as path from 'path';
import { execa } from 'execa';
import { StudioConfiguration } from '@mui/studio-core';
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

const PROJECT_DIR = resolveStudioDir(args);
const DEV_MODE = args['--dev'];
const NEXT_CMD = DEV_MODE ? 'dev' : 'start';

console.log(`Starting Studio in "${PROJECT_DIR}"`);

// TODO: read a real configuration here
const studioUiConfig: StudioConfiguration = {
  dir: PROJECT_DIR,
};

const studioUiDir = path.dirname(
  createRequire(import.meta.url).resolve('@mui/studio-ui/package.json'),
);

const cp = execa('next', [NEXT_CMD], {
  cwd: studioUiDir,
  preferLocal: true,
  stdio: 'pipe',
  extendEnv: false,
  env: {
    FORCE_COLOR: process.env.FORCE_COLOR,
    STUDIO_UI_CONFIG: JSON.stringify(studioUiConfig),
  },
});

process.stdin.pipe(cp.stdin!);
cp.stdout?.pipe(process.stdout);
cp.stderr?.pipe(process.stdout);
