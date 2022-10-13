import { NextApiRequest, NextApiResponse } from 'next';

export function reqSerializer(req: NextApiRequest) {
  return {
    url: req.url,
    method: req.method,
    query: req.query,
    type: req.body.type,
    name: req.body.name,
    // Omitting request params, but we could enable them if it would be useful
    // params: req.body.params,
    ipAddress: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    host: req.headers.host,
    userAgent: req.headers['user-agent'],
  };
}

export function resSerializer(res: NextApiResponse) {
  return {
    statusCode: res.statusCode,
  };
}
