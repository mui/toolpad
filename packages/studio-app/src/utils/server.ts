import { NextApiHandler } from 'next';

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type MethodMap = Partial<Record<Method, NextApiHandler>>;

export function createEndpoint(handlers: MethodMap): NextApiHandler {
  return async (req, res) => {
    const handler = handlers[req.method as Method];
    if (handler) {
      return handler(req, res);
    }
    return res.status(404).end();
  };
}
