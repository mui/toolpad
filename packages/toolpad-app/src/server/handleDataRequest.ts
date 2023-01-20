import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { ExecFetchResult, NodeId, SerializedError } from '@mui/toolpad-core';
import { execQuery, getApp, loadDom } from './data';
import initMiddleware from './initMiddleware';
import { VersionOrPreview } from '../types';
import * as appDom from '../appDom';
import { errorFrom, serializeError } from '../utils/errors';
import { basicAuthUnauthorized, checkBasicAuth } from './basicAuth';
import { reportSentryError } from '../utils/sentry';
import config from '../config';

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

export interface HandleDataRequestParams {
  appId: string;
  version: VersionOrPreview;
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ExecFetchResult<any>>,
  { appId, version }: HandleDataRequestParams,
) => {
  if (req.method !== 'POST') {
    // This endpoint is used both by queries and mutations
    res.status(405).end();
    return;
  }

  await cors(req, res);
  const queryNodeId = req.query.queryId as NodeId;

  if (!config.localMode) {
    const app = await getApp(appId);
    if (!app) {
      res.status(404).end();
      return;
    }

    if (!app.public) {
      if (!checkBasicAuth(req)) {
        basicAuthUnauthorized(res);
        return;
      }
    }
  }
  const dom = await loadDom(appId, version);
  const dataNode = appDom.getMaybeNode(dom, queryNodeId);

  if (!dataNode) {
    res.status(404).end();
    return;
  }

  if (!appDom.isQuery(dataNode)) {
    throw new Error(`Invalid node type for data request`);
  }

  try {
    const result = await execQuery(appId, dataNode, req.body);
    res.json(withSerializedError(result));
  } catch (error) {
    reportSentryError(error as Error);
    res.json(withSerializedError({ error }));
  }
};
