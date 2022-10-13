import * as _ from 'lodash-es';
import { NextApiRequest, NextApiResponse } from 'next';

export const reqSerializer = (req: NextApiRequest) => ({
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
});

export const resSerializer = (res: NextApiResponse) => ({
  statusCode: res.statusCode,
});
