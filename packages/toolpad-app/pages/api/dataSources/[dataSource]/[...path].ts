import { NextApiHandler } from 'next';
import invariant from 'invariant';
import { asArray } from '../../../../src/utils/collections';
import serverDataSources from '../../../../src/toolpadDataSources/server';
import { getConnectionParams, setConnectionParams } from '../../../../src/server/data';
import { withReqResLogs } from '../../../../src/server/logs/withLogs';

const handlerMap = new Map<String, Function | null | undefined>();
Object.keys(serverDataSources).forEach((dataSource) => {
  const handler = serverDataSources[dataSource]?.createHandler?.();
  if (handler) {
    invariant(
      typeof handler === 'function',
      `Received a "${typeof handler}" instead of a "function" for the "${dataSource}" handler`,
    );
    handlerMap.set(dataSource, handler);
  }
});

const apiHandler = (async (req, res) => {
  if (req.method === 'GET') {
    const [dataSource] = asArray(req.query.dataSource);
    if (!dataSource) {
      throw new Error(`Missing path parameter "dataSource"`);
    }
    const handler = handlerMap.get(dataSource);
    if (typeof handler === 'function') {
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

export default withReqResLogs(apiHandler);
