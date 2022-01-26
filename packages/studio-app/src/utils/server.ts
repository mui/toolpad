import { NextApiHandler } from 'next';

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type MethodMap = Partial<Record<Method, NextApiHandler>>;

export function createEndpoint(handlers: MethodMap): NextApiHandler {
  return async (req, res): Promise<void> => {
    const handler = handlers[req.method as Method];
    if (handler) {
      await handler(req, res);
      return;
    }
    res.status(404).end();
  };
}
