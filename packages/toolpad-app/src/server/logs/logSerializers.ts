import { errorFrom } from '@mui/toolpad-utils/errors';
import { IncomingMessage, ServerResponse } from 'http';

function getReqLoggableIPAddress(req: IncomingMessage): string | null {
  const forwardedHeader = req.headers['x-forwarded-for'];
  return (
    (typeof forwardedHeader === 'string' && forwardedHeader.split(',').shift()) ||
    req.socket?.remoteAddress ||
    null
  );
}

export function reqSerializer(req: IncomingMessage) {
  return {
    url: req.url,
    method: req.method,
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

export function resSerializer(res: ServerResponse) {
  return {
    statusCode: res.statusCode,
  };
}

export function errSerializer(rawError: unknown) {
  const error = errorFrom(rawError);
  return {
    message: error.message,
    name: error.name,
    stack: error.stack,
    code: error.code,
  };
}
