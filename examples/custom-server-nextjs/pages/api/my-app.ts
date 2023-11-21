import { createHandler } from '@mui/toolpad';

export const config = {
  api: {
    externalResolver: true,
  },
};

if (globalThis.toolpad) {
  await globalThis.toolpad.dispose();
}

globalThis.toolpad = await createHandler({
  dev: process.env.NODE_ENV === 'development',
  base: '/api/my-app',
});

export default (req, res) => {
  globalThis.toolpad.handler(req, res);
};
