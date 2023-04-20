import pino from 'pino';
import type { NextApiRequest, NextApiResponse } from 'next';
import { errSerializer, reqSerializer, resSerializer } from './logSerializers';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: { paths: [] },
  serializers: {
    err: errSerializer,
    error: errSerializer,
    req: reqSerializer,
    res: resSerializer,
  },
});

interface ReqResLogPayload {
  key: 'apiReqRes';
  req: NextApiRequest;
  res: NextApiResponse;
}

interface RpcReqResLogPayload {
  key: 'rpc';
  type: 'query' | 'mutation';
  name: string;
  error: Error | null;
}

type LogPayload = ReqResLogPayload | RpcReqResLogPayload;

function logMethod(method: 'info' | 'trace' | 'error' | 'warn' | 'fatal') {
  return (obj: LogPayload, msg: string) => logger[method](obj, msg);
}

export default {
  info: logMethod('info'),
  trace: logMethod('trace'),
  error: logMethod('error'),
  warn: logMethod('warn'),
  fatal: logMethod('fatal'),
};
