import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import logInfo from './logInfo';

export const withReqResLogs =
  (apiHandler: NextApiHandler) =>
  (req: NextApiRequest, res: NextApiResponse): unknown | Promise<unknown> => {
    logInfo(
      {
        key: 'apiReqRes',
        req,
        res,
      },
      'Handled request',
    );

    return apiHandler(req, res);
  };

export const withRpcReqResLogs =
  (apiHandler: NextApiHandler) =>
  (req: NextApiRequest, res: NextApiResponse): unknown | Promise<unknown> => {
    logInfo(
      {
        key: 'rpcReqRes',
        rpcReq: req,
        res,
      },
      `Handled request (${req.body.type}:${req.body.name})`,
    );

    return apiHandler(req, res);
  };
