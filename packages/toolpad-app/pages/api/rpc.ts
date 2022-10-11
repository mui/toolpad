import { NextApiHandler } from 'next';
import type { IncomingMessage, ServerResponse } from 'http';
import superjson from 'superjson';
import { withSentry } from '@sentry/nextjs';
import {
  getApps,
  getApp,
  getActiveDeployments,
  createApp,
  updateApp,
  duplicateApp,
  execQuery,
  dataSourceFetchPrivate,
  loadDom,
  saveDom,
  createRelease,
  getReleases,
  getRelease,
  createDeployment,
  findActiveDeployment,
  findLastRelease,
  deleteApp,
  deploy,
  getDeployments,
} from '../../src/server/data';
import { getLatestToolpadRelease } from '../../src/server/getLatestRelease';
import { hasOwnProperty } from '../../src/utils/collections';

export const config = {
  api: {
    // Supresses false positive nextjs warning "API resolved without sending a response" caused by Sentry
    // Sentry should fix this eventually: https://github.com/getsentry/sentry-javascript/issues/3852
    externalResolver: true,
  },
};

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
      error: { message: string; stack?: string };
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
    try {
      rawResult = await method({ params, req, res });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        res.json({ error: { message: error.message, stack: error.stack } });
      } else {
        res.status(500).end();
      }

      return;
    }
    const responseData: RpcResponse = { result: superjson.stringify(rawResult) };
    res.json(responseData);
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
    getApps: createMethod<typeof getApps>(({ params }) => {
      return getApps(...params);
    }),
    getActiveDeployments: createMethod<typeof getActiveDeployments>(({ params }) => {
      return getActiveDeployments(...params);
    }),
    getDeployments: createMethod<typeof getDeployments>(({ params }) => {
      return getDeployments(...params);
    }),
    getApp: createMethod<typeof getApp>(({ params }) => {
      return getApp(...params);
    }),
    execQuery: createMethod<typeof execQuery>(({ params }) => {
      return execQuery(...params);
    }),
    getReleases: createMethod<typeof getReleases>(({ params }) => {
      return getReleases(...params);
    }),
    getRelease: createMethod<typeof getRelease>(({ params }) => {
      return getRelease(...params);
    }),
    findActiveDeployment: createMethod<typeof findActiveDeployment>(({ params }) => {
      return findActiveDeployment(...params);
    }),
    loadDom: createMethod<typeof loadDom>(({ params }) => {
      return loadDom(...params);
    }),
    findLastRelease: createMethod<typeof findLastRelease>(({ params }) => {
      return findLastRelease(...params);
    }),
    getLatestToolpadRelease: createMethod<typeof getLatestToolpadRelease>(({ params }) => {
      return getLatestToolpadRelease(...params);
    }),
  },
  mutation: {
    createApp: createMethod<typeof createApp>(({ params }) => {
      return createApp(...params);
    }),
    updateApp: createMethod<typeof updateApp>(({ params }) => {
      return updateApp(...params);
    }),
    duplicateApp: createMethod<typeof duplicateApp>(({ params }) => {
      return duplicateApp(...params);
    }),
    deleteApp: createMethod<typeof deleteApp>(({ params }) => {
      return deleteApp(...params);
    }),
    createRelease: createMethod<typeof createRelease>(({ params }) => {
      return createRelease(...params);
    }),
    createDeployment: createMethod<typeof createDeployment>(({ params }) => {
      return createDeployment(...params);
    }),
    deploy: createMethod<typeof deploy>(({ params }) => {
      return deploy(...params);
    }),
    saveDom: createMethod<typeof saveDom>(({ params }) => {
      return saveDom(...params);
    }),
  },
} as const;

export type ServerDefinition = MethodsOf<typeof rpcServer>;

export default withSentry(createRpcHandler(rpcServer));
