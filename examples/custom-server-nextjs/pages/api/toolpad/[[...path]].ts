import { createApiHandler } from '@toolpad/studio/next';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

export default createApiHandler({ dir: './toolpad', base: '/api/toolpad' });
