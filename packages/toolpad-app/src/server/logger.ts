import pino from 'pino';
import ecsFormat from '@elastic/ecs-pino-format';

import { NextApiRequest, NextApiResponse } from 'next';
import config from './config';
import { reqSerializer, resSerializer, rpcReqSerializer } from './logSerializers';

let transport;
if (config.ecsHostUrl) {
  transport = pino.transport({
    target: 'pino-elasticsearch',
    options: {
      index: 'toolpad-pino',
      host: config.ecsHostUrl,
      auth: {
        apiKey: config.ecsApiKey,
      },
    },
  });
}

type ReqResLogPayload = {
  key: 'apiReqRes';
  req: NextApiRequest;
  res: NextApiResponse;
};

type RpcReqResLogPayload = {
  key: 'rpcReqRes';
  rpcReq: NextApiRequest;
  res: NextApiResponse;
};

type LogPayload = ReqResLogPayload | RpcReqResLogPayload;

const logger = pino(
  {
    enabled: config.apiLogsEnabled,
    level: process.env.LOG_LEVEL || 'info',
    redact: { paths: [] },
    serializers: {
      err: pino.stdSerializers.err,
      req: reqSerializer,
      rpcReq: rpcReqSerializer,
      res: resSerializer,
    },
    ...(config.ecsHostUrl ? ecsFormat() : {}),
  },
  transport,
);

export function logInfo(payload: LogPayload, message?: string): void {
  logger.info(payload, message);
}
