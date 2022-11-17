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
      'Handled API request',
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
      'Handled RPC request',
    );

    return apiHandler(req, res);
  };
