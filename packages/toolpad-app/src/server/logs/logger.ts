import pino from 'pino';
import ecsFormat from '@elastic/ecs-pino-format';

import config from '../config';
import {
  reqSerializer,
  resSerializer,
  rpcReqSerializer,
  rpcResSerializer,
  rpcResErrSerializer,
} from './logSerializers';

let transport;
if (config.ecsNodeUrl) {
  transport = pino.transport({
    target: 'pino-elasticsearch',
    options: {
      index: 'toolpad-pino',
      node: config.ecsNodeUrl,
      op_type: 'create',
      auth: {
        apiKey: config.ecsApiKey,
      },
    },
  });
}

const logger = pino(
  {
    enabled: config.serverLogsEnabled,
    level: process.env.LOG_LEVEL || 'info',
    redact: { paths: [] },
    serializers: {
      req: reqSerializer,
      res: resSerializer,
      err: pino.stdSerializers.err,
      rpcReq: rpcReqSerializer,
      rpcRes: rpcResSerializer,
      rpcErr: rpcResErrSerializer,
    },
    ...(config.ecsNodeUrl ? ecsFormat() : {}),
  },
  transport,
);

export default logger;
