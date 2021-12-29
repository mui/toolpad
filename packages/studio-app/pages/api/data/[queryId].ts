import { NextApiHandler } from 'next';
import Cors from 'cors';
import { getConnection, getQuery } from '../../../src/server/data';
import studioDataSources from '../../../src/studioDataSources/server';
import { StudioQueryResult } from '../../../src/types';
import initMiddleware from '../../../src/initMiddleware';

export type DataApiResult<Q> =
  | {
      result: StudioQueryResult<Q>;
      error?: undefined;
    }
  | {
      result?: undefined;
      error: string;
    };

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
  const connection = await getConnection(query.connectionId);
  const dataSource = studioDataSources[connection.type];
  if (!dataSource) {
    return res.json({
      error: `Unknown connection type "${connection.type}" for connection "${query.connectionId}"`,
    });
  }
  const result = await dataSource.query(connection, query.query);
  return res.json({ result });
}) as NextApiHandler<DataApiResult<any>>;
