import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { ExecFetchResult, SerializedError } from '@mui/toolpad-core';
import { asArray } from '@mui/toolpad-core/utils/collections';
import invariant from 'invariant';
import { withReqResLogs } from '../../../../src/server/logs/withLogs';
import { execQuery, loadDom } from '../../../../src/server/data';
import initMiddleware from '../../../../src/server/initMiddleware';
import * as appDom from '../../../../src/appDom';
import { errorFrom, serializeError } from '../../../../src/utils/errors';

// Initialize the cors middleware
const cors = initMiddleware<any>(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    // TODO: make this configurable
    origin: '*',
  }),
);

function withSerializedError<T extends { error?: unknown }>(
  withError: T,
): Omit<T, 'error'> & { error?: SerializedError } {
  const { error, ...withoutError } = withError;
  return withError.error
    ? { ...withoutError, error: serializeError(errorFrom(error)) }
    : withoutError;
}

const apiHandler = (async (req, res) => {
  if (req.method !== 'POST') {
    // This endpoint is used both by queries and mutations
    res.status(405).end();
    return;
  }

  await cors(req, res);
  const [pageName] = asArray(req.query.pageName);
  invariant(pageName, 'pageName url variable required');

  const [queryName] = asArray(req.query.queryName);
  invariant(queryName, 'queryName url variable required');

  const dom = await loadDom();

  const page = appDom.getPageByName(dom, pageName);

  if (!page) {
    res.status(404).end();
    return;
  }

  const dataNode = appDom.getQueryByName(dom, page, queryName);

  if (!dataNode) {
    res.status(404).end();
    return;
  }

  if (!appDom.isQuery(dataNode)) {
    throw new Error(`Invalid node type for data request`);
  }

  try {
    const result = await execQuery(dataNode, req.body);
    res.json(withSerializedError(result));
  } catch (error) {
    res.json(withSerializedError({ error }));
  }
}) satisfies NextApiHandler<ExecFetchResult<any>>;

export default withReqResLogs(apiHandler);
