#!/usr/bin/env node

import 'dotenv/config';
import { generateCommand } from './liveConfigurator';

generateCommand({ dir: '.' }).catch((err) => {
  console.error(err);
});
