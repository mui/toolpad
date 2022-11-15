import { NextApiRequest } from 'next';

export function getReqLoggableIPAddress(req: NextApiRequest): string | null {
  const forwardedHeader = req.headers['x-forwarded-for'];
  return (
    (typeof forwardedHeader === 'string' && forwardedHeader.split(',').shift()) ||
    req.socket?.remoteAddress ||
    null
  );
}
