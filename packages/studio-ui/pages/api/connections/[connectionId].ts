import { NextApiHandler } from 'next';
import { StudioConnection } from '../../../lib/types';
import { getConnection, updateConnection } from '../../../lib/data';

export default (async (req, res) => {
  switch (req.method) {
    case 'GET':
      return res.json(await getConnection(req.query.pageId as string));
    case 'PUT':
      return res.json(await updateConnection(req.body as StudioConnection));
    default:
      return res.status(404).end();
  }
}) as NextApiHandler<StudioConnection>;
