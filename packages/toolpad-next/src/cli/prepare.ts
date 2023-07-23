#!/usr/bin/env node

import 'dotenv/config';
import { generateCommand } from './liveConfigurator';

generateCommand({ dir: '.' });
