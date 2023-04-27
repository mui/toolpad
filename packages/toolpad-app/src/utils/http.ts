import * as express from 'express';
import * as http from 'http';
import { Awaitable } from './types';

/**
 * async version of http.Server listen(port) method
 */
export async function listen(server: http.Server, port?: number) {
  await new Promise<void>((resolve, reject) => {
    const handleError = (err: Error) => {
      reject(err);
    };
    server.once('error', handleError).listen(port, () => {
      server.off('error', handleError);
      resolve();
    });
  });
}

export function asyncHandler(
  handler: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => Awaitable<void>,
): express.RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
