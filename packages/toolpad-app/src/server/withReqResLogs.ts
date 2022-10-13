import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import logger from './logger';

function getLogMessageInfo(req: NextApiRequest) {
  const { type, name } = req.body;
  return type && name ? `${type}:${name}` : '';
}

const withReqResLogs =
  (apiHandler: NextApiHandler) =>
  (req: NextApiRequest, res: NextApiResponse): unknown | Promise<unknown> => {
    const logMessageInfo = getLogMessageInfo(req);

    logger.info(
      {
        req,
        res,
      },
      `Handled request ${logMessageInfo ? `(${logMessageInfo})` : ''}`,
    );

    return apiHandler(req, res);
  };

export default withReqResLogs;
