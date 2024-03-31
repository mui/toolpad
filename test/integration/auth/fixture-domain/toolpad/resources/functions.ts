import { getContext } from '@toolpad/studio/server';

export async function getMySession() {
  const context = getContext();
  return context.session;
}
