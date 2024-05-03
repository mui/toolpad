import { createApiHandler } from '@toolpad/studio/next';
import { getProject } from '../../../toolpad-server';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

const project = await getProject();

export default createApiHandler(project, { base: '/api/toolpad' });
