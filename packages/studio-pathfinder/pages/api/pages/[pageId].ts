import { NextApiHandler } from 'next';
import { StudioPage } from '../../../lib/types';
import { getPage, updatePage } from '../../../lib/data';

export default (async (req, res) => {
  switch (req.method) {
    case 'GET':
      return res.json(await getPage(req.query.pageId as string));
    case 'PUT':
      return res.json(await updatePage(req.body as StudioPage));
    default:
      return res.status(404).end();
  }
}) as NextApiHandler<StudioPage>;
