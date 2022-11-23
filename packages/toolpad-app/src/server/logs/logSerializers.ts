import { NextApiRequest, NextApiResponse } from 'next';

function getReqLoggableIPAddress(req: NextApiRequest): string | null {
  const forwardedHeader = req.headers['x-forwarded-for'];
  return (
    (typeof forwardedHeader === 'string' && forwardedHeader.split(',').shift()) ||
    req.socket?.remoteAddress ||
    null
  );
}

export function reqSerializer(req: NextApiRequest) {
  return {
    url: req.url,
    method: req.method,
    query: req.query,
    body: {
      type: req.body.type,
      name: req.body.name,
      // Omitting request params, but we could enable them if it would be useful
      // params: req.body.params,
    },
    headers: {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      host: req.headers.host,
      userAgent: req.headers['user-agent'],
    },
    socket: {
      remoteAddress: req.socket?.remoteAddress,
    },
    ipAddress: getReqLoggableIPAddress(req),
  };
}

export function resSerializer(res: NextApiResponse) {
  return {
    statusCode: res.statusCode,
  };
}

export function resErrSerializer(error: Error) {
  return {
    message: error.message,
    code: error.code,
  };
}
