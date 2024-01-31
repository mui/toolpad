import * as express from 'express';
import { Awaitable } from '@mui/toolpad-utils/types';

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
