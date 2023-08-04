#!/usr/bin/env node

import 'dotenv/config';
import { generateCommand } from './liveConfigurator';

// eslint-disable-next-line no-console
console.log(`Generating components...
cwd: ${process.cwd()}`);
generateCommand({ dir: '.' }).catch((err) => {
  console.error(err);
});
