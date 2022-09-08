import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { ExecFetchResult, NodeId } from '@mui/toolpad-core';
import { execQuery, loadDom } from './data';
import initMiddleware from './initMiddleware';
import { VersionOrPreview } from '../types';
import * as appDom from '../appDom';
import { errorFrom } from '../utils/errors';

// Initialize the cors middleware
const cors = initMiddleware<any>(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    // TODO: make this configurable
    origin: '*',
  }),
);

function serializeError(error: Error) {
  const { message, name, stack } = error;
  return { message, name, stack };
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
  const dom = await loadDom(appId, version);
  const dataNode = appDom.getNode(dom, queryNodeId);

  if (!appDom.isQuery(dataNode) && !appDom.isMutation(dataNode)) {
    throw new Error(`Invalid node type for data request`);
  }

  try {
    const result = await execQuery(appId, dataNode, req.body);
    res.json(result);
  } catch (error) {
    res.json({ error: serializeError(errorFrom(error)) });
  }
};
