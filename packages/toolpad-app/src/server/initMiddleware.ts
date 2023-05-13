import { IncomingMessage, ServerResponse } from 'http';
import { NextApiHandler } from 'next';

export interface NextFunction {
  (err?: any): void;
}

export interface RequestHandler {
  (req: IncomingMessage, res: ServerResponse, next: NextFunction): any;
}

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
export default function initMiddleware<T>(middleware: RequestHandler): NextApiHandler<T> {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}
