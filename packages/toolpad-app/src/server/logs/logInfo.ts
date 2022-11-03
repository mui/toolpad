import type { NextApiRequest, NextApiResponse } from 'next';
import logger from './logger';
import type { RpcResponse } from '../../../pages/api/rpc';

type ReqResLogPayload = {
  key: 'apiReqRes';
  req: NextApiRequest;
  res: NextApiResponse;
};

type RpcReqResLogPayload = {
  key: 'rpcReqRes';
  rpcReq: NextApiRequest;
  rpcRes: NextApiResponse;
  rpcResErr?: RpcResponse['error'];
};

type LogPayload = ReqResLogPayload | RpcReqResLogPayload;

function logInfo(payload: LogPayload, message?: string): void {
  logger.info(payload, message);
}

export default logInfo;
