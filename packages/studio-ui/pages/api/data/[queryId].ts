import { NextApiHandler } from 'next';
import { getConnection } from '../../../lib/data';
import studioDataSources from '../../../lib/studioDataSources/server';
import { StudioPageQuery, StudioQueryResult } from '../../../lib/types';

export type DataApiResult<Q> =
  | {
      result: StudioQueryResult<Q>;
      error?: undefined;
    }
  | {
      result?: undefined;
      error: string;
    };

export default (async (req, res) => {
  // TODO: this should only read the query from the body when the session has editing rights
  // if it's a viewer session, the query should be read out of the stored page using the queryId
  const pageQuery = req.body as StudioPageQuery<any>;
  const connection = await getConnection(pageQuery.connectionId);
  const dataSource = studioDataSources[connection.type];
  if (!dataSource) {
    return res.json({
      error: `Unknown connection type "${connection.type}" for connection "${pageQuery.connectionId}"`,
    });
  }
  const result = await dataSource.query(connection, pageQuery.query);
  return res.json({ result });
}) as NextApiHandler<DataApiResult<any>>;
