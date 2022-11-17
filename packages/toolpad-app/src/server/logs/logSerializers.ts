import { NextApiRequest, NextApiResponse } from 'next';

export function reqSerializer(req: NextApiRequest) {
  return {
    url: req.url,
    method: req.method,
    query: req.query,
    body: {
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
  };
}

export function resSerializer(res: NextApiResponse) {
  return {
    statusCode: res.statusCode,
  };
}

export function rpcReqSerializer(req: NextApiRequest) {
  return {
    ...reqSerializer(req),
    body: {
      type: req.body.type,
      name: req.body.name,
    },
  };
}

export function resErrSerializer(error: Error) {
  return {
    message: error.message,
    code: error.code,
  };
}
