import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import * as _ from 'lodash-es';
import logger from './logger';

const withReqResLogs =
  (apiHandler: NextApiHandler) =>
  (req: NextApiRequest, res: NextApiResponse): unknown | Promise<unknown> => {
    logger.info(
      {
        req: {
          ..._.pick(req, ['url', 'method']),
          ...(!_.isEmpty(req.query) ? { query: req.query } : {}),
          body: _.pick(req.body, [
            'type',
            'name',
            // Omitting request params, but we could enable them if it would be useful
            // 'params'
          ]),
          headers: _.pick(req.headers, ['x-forwarded-for', 'host', 'user-agent']),
          socket: _.pick(req.socket, ['remoteAddress']),
        },
        res: {
          statusCode: res.statusCode,
        },
      },
      'handled request',
    );

    return apiHandler(req, res);
  };

export default withReqResLogs;
