import arg from 'arg';
import * as path from 'path';
import execa from 'execa';
import { StudioConfiguration } from '@mui/studio-core';

const args = arg({
  // Types
  '--help': Boolean,
  '--dev': Boolean,
  '--port': Number,
  // Aliases
  '-p': '--port',
});

const DEV_MODE = args['--dev'];
const NEXT_CMD = DEV_MODE ? 'dev' : 'start';

const studioUiDir = path.dirname(require.resolve('@mui/studio-ui/package.json'));

// TODO: read a real configuration here
const studioUiConfig: StudioConfiguration = {
  foo: 'bar',
};

execa('next', [NEXT_CMD], {
  cwd: studioUiDir,
  preferLocal: true,
  stdio: 'inherit',
  extendEnv: false,
  env: {
    FORCE_COLOR: process.env.FORCE_COLOR,
    STUDIO_UI_CONFIG: JSON.stringify(studioUiConfig),
  },
});
