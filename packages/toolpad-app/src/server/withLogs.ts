import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { logInfo } from './logger';

function getLogMessageInfo(req: NextApiRequest) {
  const { type, name } = req.body;
  return type && name ? `${type}:${name}` : '';
}

export const withReqResLogs =
  (apiHandler: NextApiHandler) =>
  (req: NextApiRequest, res: NextApiResponse): unknown | Promise<unknown> => {
    const logMessageInfo = getLogMessageInfo(req);

    logInfo(
      {
        key: 'apiReqRes',
        req,
        res,
      },
      `Handled request ${logMessageInfo ? `(${logMessageInfo})` : ''}`,
    );

    return apiHandler(req, res);
  };

export const withRpcReqResLogs =
  (apiHandler: NextApiHandler) =>
  (req: NextApiRequest, res: NextApiResponse): unknown | Promise<unknown> => {
    const logMessageInfo = getLogMessageInfo(req);

    logInfo(
      {
        key: 'rpcReqRes',
        rpcReq: req,
        res,
      },
      `Handled request ${logMessageInfo ? `(${logMessageInfo})` : ''}`,
    );

    return apiHandler(req, res);
  };
