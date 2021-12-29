import { NextApiHandler } from 'next';
import Cors from 'cors';
import { fetchQueryData, getQuery } from '../../../src/server/data';
import { StudioQueryResult } from '../../../src/types';
import initMiddleware from '../../../src/initMiddleware';

// Initialize the cors middleware
const cors = initMiddleware<any>(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    // TODO: make this configurable
    origin: '*',
  }),
);

export default (async (req, res) => {
  await cors(req, res);
  const query = await getQuery(req.query.queryId as string);
  res.json(await fetchQueryData(query));
}) as NextApiHandler<StudioQueryResult<any>>;
