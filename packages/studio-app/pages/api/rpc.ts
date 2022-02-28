import { NextApiHandler } from 'next';
import { AsyncLocalStorage } from 'async_hooks';
import type { IncomingMessage, ServerResponse } from 'http';
import {
  testConnection,
  execApi,
  loadDom,
  saveDom,
  createRelease,
  deleteRelease,
  getReleases,
  loadReleaseDom,
} from '../../src/server/data';
import { hasOwnProperty } from '../../src/utils/collections';

const asyncLocalStorage = new AsyncLocalStorage<NextRpcContext>();

export function getContext(): NextRpcContext {
  const ctx = asyncLocalStorage.getStore();
  if (!ctx) {
    throw new Error('Not in a request context');
  }
  return ctx;
}

interface NextRpcContext {
  req: IncomingMessage;
  res: ServerResponse;
}

export interface Method<P extends any[] = any[], R = any> {
  (...params: P): Promise<R>;
}

export interface Methods {
  readonly [key: string]: Method;
}

export interface Definition {
  readonly query: Methods;
  readonly mutation: Methods;
}

export interface RpcRequest {
  type: 'query' | 'mutation';
  name: string;
  params: any[];
}

export interface RpcResponse {
  result: any;
}

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
    const method = definition[type][name];
    const context = { req, res };
    const result = await asyncLocalStorage.run(context, () => method(...params));
    res.json({ result });
  };
}

const rpcServer = {
  query: {
    execApi: (...args: Parameters<typeof execApi>) => {
      // DEMO: how we can add authentication in the mix:
      //   const ctx = getContext();
      //   console.log(ctx.req.headers);
      return execApi(...args);
    },

    getReleases,
    loadReleaseDom,
    loadDom,
  },
  mutation: {
    createRelease,
    deleteRelease,
    testConnection,
    saveDom,
  },
} as const;

export type ServerDefinition = typeof rpcServer;

export default createRpcHandler(rpcServer);
