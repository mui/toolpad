import { NextApiHandler } from 'next';
import { asArray } from 'src/utils/collections';
import studioConnections from 'src/studioDataSources/server';

const handlerMap = new Map<String, Function | null | undefined>();
Object.keys(studioConnections).forEach((dataSource) => {
  handlerMap.set(dataSource, studioConnections[dataSource]?.createHandler);
});

export default (async (req, res) => {
  if (req.method === 'GET') {
    const [dataSource] = asArray(req.query.type);
    const handler = handlerMap.get(dataSource);
    if (handler) {
      return handler(req, res);
    }
    return null;
  } else {
    // Handle any other HTTP method
    return null;
  }
}) as NextApiHandler;
