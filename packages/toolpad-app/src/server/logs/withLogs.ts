import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import logger from './logger';

export const withReqResLogs =
  (apiHandler: NextApiHandler) =>
  (req: NextApiRequest, res: NextApiResponse): unknown | Promise<unknown> => {
    logger.trace(
      {
        key: 'apiReqRes',
        req,
        res,
      },
      'Handled API request',
    );

    return apiHandler(req, res);
  };
