import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { getReqLoggableIPAddress } from '../../utils/logs';
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
      `Handled API request (${getReqLoggableIPAddress(req)})`,
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
      `Handled RPC request (${req.body.type}:${req.body.name}) (${getReqLoggableIPAddress(req)})`,
    );

    return apiHandler(req, res);
  };
