import crypto from 'crypto';

export async function createNewUUID() {
  const uuid = crypto.randomUUID();
  return uuid;
}
