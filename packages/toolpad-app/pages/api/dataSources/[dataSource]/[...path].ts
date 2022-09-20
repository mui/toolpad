import { NextApiHandler } from 'next';
import { withSentry } from '@sentry/nextjs';
import { asArray } from '../../../../src/utils/collections';
import serverDataSources from '../../../../src/toolpadDataSources/server';
import { getConnectionParams, setConnectionParams } from '../../../../src/server/data';

const handlerMap = new Map<String, Function | null | undefined>();
Object.keys(serverDataSources).forEach((dataSource) => {
  handlerMap.set(dataSource, serverDataSources[dataSource]?.createHandler?.());
});

const apiHandler = (async (req, res) => {
  if (req.method === 'GET') {
    const [dataSource] = asArray(req.query.dataSource);
    if (!dataSource) {
      throw new Error(`Missing path parameter "dataSource"`);
    }
    const handler = handlerMap.get(dataSource);
    if (handler) {
      return handler(
        {
          getConnectionParams,
          setConnectionParams,
        },
        req,
        res,
      );
    }
    return res.status(404).json({ message: 'No handler found' });
  }
  // Handle any other HTTP method
  return res.status(405).json({ message: 'Method not supported' });
}) as NextApiHandler;

export default withSentry(apiHandler);
