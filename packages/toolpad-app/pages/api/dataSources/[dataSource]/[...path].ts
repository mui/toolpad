import { NextApiHandler } from 'next';
import { asArray } from '../../../../src/utils/collections';
import studioConnections from '../../../../src/studioDataSources/server';
import { getConnection, updateConnection } from '../../../../src/server/data';

const handlerMap = new Map<String, Function | null | undefined>();
Object.keys(studioConnections).forEach((dataSource) => {
  handlerMap.set(dataSource, studioConnections[dataSource]?.createHandler?.());
});

export default (async (req, res) => {
  if (req.method === 'GET') {
    const [dataSource] = asArray(req.query.dataSource);
    const handler = handlerMap.get(dataSource);
    if (handler) {
      return handler({ getConnection, updateConnection }, req, res);
    }
    return res.status(404).json({ message: 'No handler found' });
  }
  // Handle any other HTTP method
  return res.status(405).json({ message: 'Method not supported' });
}) as NextApiHandler;
