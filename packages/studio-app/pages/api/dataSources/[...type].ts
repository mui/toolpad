import { NextApiHandler } from 'next';
import { asArray } from 'src/utils/collections';
import studioConnections from 'src/studioDataSources/server';

const handlerMap = new Map<String, Function | null | undefined>();
for (let dataSource in studioConnections) {
  handlerMap.set(dataSource, studioConnections[dataSource]?.createHandler);
}

export default (async (req, res) => {
  if (req.method === 'GET') {
    const [dataSource] = asArray(req.query.type);
    const handler = handlerMap.get(dataSource);
    if (handler) {
      return handler(req, res);
    }
  } else {
    // Handle any other HTTP method
  }
}) as NextApiHandler;
