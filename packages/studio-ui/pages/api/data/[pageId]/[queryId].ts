import { NextApiHandler } from 'next';
import NextCors from 'nextjs-cors';
import { getConnection, getPage } from '../../../../lib/data';
import studioDataSources from '../../../../lib/studioDataSources/server';
import { StudioPageQuery, StudioQueryResult } from '../../../../lib/types';

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
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  // TODO: IMPORTANT this should only read the query from the body when the session has editing rights
  //       replace this with a real session check
  const isEditorSession = !!req.body?.id;
  let pageQuery: StudioPageQuery<any>;
  if (isEditorSession) {
    pageQuery = req.body as StudioPageQuery<any>;
  } else {
    const page = await getPage(req.query.pageId as string);
    pageQuery = page.queries[req.query.queryId as string]!;
  }

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
