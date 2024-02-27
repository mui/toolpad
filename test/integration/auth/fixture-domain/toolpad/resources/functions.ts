import { getContext } from '@mui/toolpad/server';

export async function getMySession() {
  const context = getContext();
  return context.session;
}
