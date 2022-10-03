import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { uuidv4 } from '../utils/uuid';
import logger from './logger';

function getLogMessageInfo(req: NextApiRequest) {
  const { type, name } = req.body;
  return type && name ? `${type}:${name}` : '';
}

function getBaseLogProperties(req: NextApiRequest) {
  return {
    type: req.body.type,
    name: req.body.name,
    ipAddress: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    host: req.headers.host,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().getTime(),
  };
}

function logRequestResponse(req: NextApiRequest, res: NextApiResponse, requestId: string) {
  const oldWrite = res.write;
  const oldEnd = res.end;

  const chunks: Buffer[] = [];

  res.write = (...restArgs: any[]) => {
    chunks.push(Buffer.from(restArgs[0]));
    return oldWrite.apply(
      res,
      restArgs as [
        chunk: any,
        encoding: BufferEncoding,
        callback?: ((error: Error | null | undefined) => void) | undefined,
      ],
    );
  };

  res.end = (...restArgs: any[]) => {
    if (restArgs[0]) {
      chunks.push(Buffer.from(restArgs[0]));
    }
    // Omitting response from logs, but we could enable it if it would be useful
    // const responseBody = Buffer.concat(chunks).toString('utf8');

    const logMessageInfo = getLogMessageInfo(req);

    logger.info(`API logs: response${logMessageInfo ? `(${logMessageInfo})` : ''}`, {
      requestId,
      statusCode: res.statusCode,
      // response: responseBody,
      ...getBaseLogProperties(req),
    });

    return oldEnd.apply(
      res,
      restArgs as [chunk: any, encoding: BufferEncoding, callback?: (() => void) | undefined],
    );
  };
}

const withReqResLogs =
  (apiHandler: NextApiHandler) =>
  (req: NextApiRequest, res: NextApiResponse): unknown | Promise<unknown> => {
    const requestId = uuidv4();

    const logMessageInfo = getLogMessageInfo(req);

    logger.info(`API logs: request${logMessageInfo ? `(${logMessageInfo})` : ''}`, {
      requestId,
      url: req.url,
      method: req.method,
      query: req.query,
      // Omitting request params, but we could enable them if it would be useful
      // params: req.body.params,
      ...getBaseLogProperties(req),
    });

    logRequestResponse(req, res, requestId);

    return apiHandler(req, res);
  };

export default withReqResLogs;
