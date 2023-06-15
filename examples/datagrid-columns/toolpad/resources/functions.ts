import { createFunction } from '@mui/toolpad/server';

import crypto from 'crypto';

export const createNewUUID = createFunction(async function createNewUUID() {
  const uuid = crypto.randomUUID();
  return uuid;
});
