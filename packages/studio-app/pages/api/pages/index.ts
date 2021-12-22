import { NextApiHandler } from 'next';
import { StudioPage, StudioPageSummary } from '../../../src/types';
import { addPage, getPages } from '../../../src/data';

export default (async (req, res) => {
  switch (req.method) {
    case 'GET':
      return res.json(await getPages());
    case 'POST': {
      if (!req.body.id) {
        throw new Error('missing page ID');
      }
      return res.json(await addPage(req.body.id));
    }
    default: {
      return res.status(404).end();
    }
  }
}) as NextApiHandler<StudioPageSummary[] | StudioPage>;
