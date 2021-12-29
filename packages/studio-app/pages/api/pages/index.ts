import { NextApiHandler } from 'next';
import { StudioPage, StudioPageSummary } from '../../../src/types';
import { addPage, getPages } from '../../../src/server/data';
import { createEndpoint } from '../../../src/utils/server';

const getPagesHandler: NextApiHandler<StudioPageSummary[]> = async (req, res) => {
  return res.json(await getPages());
};

const createPageHandler: NextApiHandler<StudioPage> = async (req, res) => {
  if (!req.body.id) {
    throw new Error('missing page ID');
  }
  return res.json(await addPage(req.body.id));
};

export default createEndpoint({
  GET: getPagesHandler,
  POST: createPageHandler,
});
