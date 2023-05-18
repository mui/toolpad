import type { IncomingMessage, ServerResponse } from 'http';
import superjson from 'superjson';
import express from 'express';
import * as z from 'zod';
import { fromZodError } from 'zod-validation-error';
import { hasOwnProperty } from '@mui/toolpad-utils/collections';
import { errorFrom, serializeError } from '@mui/toolpad-utils/errors';
import { execQuery, dataSourceFetchPrivate } from './data';
import { getVersionInfo } from './versionInfo';
import logger from './logs/logger';
import { createComponent, deletePage, openCodeComponentEditor } from './localMode';
import { loadDom, saveDom } from './liveProject';
import { asyncHandler } from '../utils/http';

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
        rawResult = await method({ params, req, res });
      } catch (rawError) {
        error = errorFrom(rawError);
      }

      const responseData: RpcResponse = error
        ? { error: serializeError(error) }
        : { result: superjson.stringify(rawResult) };

      res.json(responseData);

      const logLevel = error ? 'warn' : 'trace';
      logger[logLevel](
        {
          key: 'rpc',
          type,
          name,
          error,
        },
        'Handled RPC request',
      );
    }),
  );
  return router;
}

interface ResolverInput<P> {
  params: P;
  req: IncomingMessage;
  res: ServerResponse;
}

interface MethodResolver<F extends Method> {
  (input: ResolverInput<Parameters<F>>): ReturnType<F>;
}

function createMethod<F extends Method>(handler: MethodResolver<F>): MethodResolver<F> {
  return handler;
}

export const rpcServer = {
  query: {
    dataSourceFetchPrivate: createMethod<typeof dataSourceFetchPrivate>(({ params }) => {
      return dataSourceFetchPrivate(...params);
    }),
    execQuery: createMethod<typeof execQuery>(({ params }) => {
      return execQuery(...params);
    }),
    loadDom: createMethod<typeof loadDom>(({ params }) => {
      return loadDom(...params);
    }),
    getVersionInfo: createMethod<typeof getVersionInfo>(({ params }) => {
      return getVersionInfo(...params);
    }),
  },
  mutation: {
    saveDom: createMethod<typeof saveDom>(({ params }) => {
      return saveDom(...params);
    }),
    openCodeComponentEditor: createMethod<typeof openCodeComponentEditor>(({ params }) => {
      return openCodeComponentEditor(...params);
    }),
    createComponent: createMethod<typeof createComponent>(({ params }) => {
      return createComponent(...params);
    }),
    deletePage: createMethod<typeof deletePage>(({ params }) => {
      return deletePage(...params);
    }),
  },
} as const;

export type ServerDefinition = MethodsOf<typeof rpcServer>;
