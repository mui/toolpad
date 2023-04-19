import { NextApiHandler } from 'next';
import type { IncomingMessage, ServerResponse } from 'http';
import superjson from 'superjson';
import { execQuery, dataSourceFetchPrivate } from '../../src/server/data';
import { getLatestToolpadRelease } from '../../src/server/getLatestRelease';
import { hasOwnProperty } from '../../src/utils/collections';
import { errorFrom, serializeError } from '../../src/utils/errors';
import logger from '../../src/server/logs/logger';
import { createComponent, openCodeComponentEditor } from '../../src/server/localMode';
import { getDomFingerprint, loadDom, saveDom } from '../../src/server/liveProject';

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

export interface RpcRequest {
  type: 'query' | 'mutation';
  name: string;
  params: any[];
}

export type RpcResponse =
  | {
      result: string;
      error?: undefined;
    }
  | {
      error: { message: string; code?: unknown; stack?: string };
    };

function createRpcHandler(definition: Definition): NextApiHandler<RpcResponse> {
  return async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).end();
      return;
    }

    const { type, name, params } = req.body as RpcRequest;

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
  };
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

const rpcServer = {
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
    getLatestToolpadRelease: createMethod<typeof getLatestToolpadRelease>(({ params }) => {
      return getLatestToolpadRelease(...params);
    }),
    getDomFingerprint: createMethod<typeof getDomFingerprint>(({ params }) => {
      return getDomFingerprint(...params);
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
  },
} as const;

export type ServerDefinition = MethodsOf<typeof rpcServer>;

export default createRpcHandler(rpcServer);
