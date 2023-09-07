import type { IncomingMessage, ServerResponse } from 'http';
import superjson from 'superjson';
import express from 'express';
import * as z from 'zod';
import { fromZodError } from 'zod-validation-error';
import { hasOwnProperty } from '@mui/toolpad-utils/collections';
import { errorFrom, serializeError } from '@mui/toolpad-utils/errors';
import { withContext, createServerContext } from '@mui/toolpad-core/serverRuntime';
import { asyncHandler } from '../utils/express';

export interface Method<P extends any[] = any[], R = any> {
  (...params: P): Promise<R>;
}
export interface MethodsGroup {
  readonly [key: string]: Method;
}

export interface MethodResolvers {
  readonly [key: string]: MethodResolver<any>;
}

export interface Definition {
  readonly query: MethodResolvers;
  readonly mutation: MethodResolvers;
}

export type MethodsOfGroup<R extends MethodResolvers> = {
  [K in keyof R]: (...params: Parameters<R[K]>[0]['params']) => ReturnType<R[K]>;
};

export interface MethodsOf<D extends Definition> {
  readonly query: MethodsOfGroup<D['query']>;
  readonly mutation: MethodsOfGroup<D['mutation']>;
}

const rpcRequestSchema = z.object({
  type: z.union([z.literal('query'), z.literal('mutation')]),
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

export function createRpcHandler(definition: Definition): express.RequestHandler {
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

      const { type, name, params } = parseResult.data;

      if (!hasOwnProperty(definition, type) || !hasOwnProperty(definition[type], name)) {
        // This is important to avoid RCE
        res.status(404).end();
        return;
      }
      const method: MethodResolver<any> = definition[type][name];

      let rawResult;
      let error: Error | null = null;
      try {
        const ctx = createServerContext(req, res);
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

interface ResolverInput<P> {
  params: P;
  req: IncomingMessage;
  res: ServerResponse;
}

export interface MethodResolver<F extends Method> {
  (input: ResolverInput<Parameters<F>>): ReturnType<F>;
}

export function createMethod<F extends Method>(handler: MethodResolver<F>): MethodResolver<F> {
  return handler;
}
