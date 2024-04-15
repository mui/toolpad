import type { IncomingMessage, ServerResponse } from 'http';
import * as superjson from 'superjson';
import express from 'express';
import * as z from 'zod';
import { fromZodError } from 'zod-validation-error';
import { hasOwnProperty } from '@toolpad/utils/collections';
import { errorFrom, serializeError } from '@toolpad/utils/errors';
import { withContext, createServerContext } from '@toolpad/studio-runtime/serverRuntime';
import { asyncHandler } from '../utils/express';

export interface Method<P extends any[] = any[], R = any> {
  (...params: P): Promise<R>;
}

export interface Methods {
  readonly [key: string]: Method;
}

interface ResolverInput<P> {
  params: P;
  req: IncomingMessage;
  res: ServerResponse;
}

export interface MethodResolver<F extends Method> {
  (input: ResolverInput<Parameters<F>>): ReturnType<F>;
}

export interface MethodResolvers {
  readonly [key: string]: MethodResolver<any>;
}

export type MethodsOf<R extends MethodResolvers> = {
  [K in keyof R]: (...params: Parameters<R[K]>[0]['params']) => ReturnType<R[K]>;
};

const rpcRequestSchema = z.object({
  name: z.string(),
  params: z.array(z.any()),
});

export type RpcRequest = z.infer<typeof rpcRequestSchema>;

export type RpcResponse =
  | {
      result: string;
      error?: undefined;
    }
  | {
      error: { message: string; code?: unknown; stack?: string };
    };

export function createRpcHandler(definition: MethodResolvers): express.RequestHandler {
  const router = express.Router();
  router.post(
    '/',
    express.json(),
    asyncHandler(async (req, res) => {
      const parseResult = rpcRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).send(fromZodError(parseResult.error));
        return;
      }

      const { name, params } = parseResult.data;

      if (!hasOwnProperty(definition, name)) {
        // This is important to avoid RCE
        res.status(404).end();
        return;
      }
      const method: MethodResolver<any> = definition[name];

      let rawResult;
      let error: Error | null = null;
      try {
        const ctx = await createServerContext(req, res);
        rawResult = await withContext(ctx, async () => {
          return method({ params, req, res });
        });
      } catch (rawError) {
        error = errorFrom(rawError);
      }

      const responseData: RpcResponse = error
        ? { error: serializeError(error) }
        : { result: superjson.stringify(rawResult) };

      res.json(responseData);
    }),
  );
  return router;
}

export function createMethod<F extends Method>(handler: MethodResolver<F>): MethodResolver<F> {
  return handler;
}
