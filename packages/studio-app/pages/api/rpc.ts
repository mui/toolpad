import { NextApiHandler } from 'next';
import { AsyncLocalStorage } from 'async_hooks';
import type { IncomingMessage, ServerResponse } from 'http';
import {
  getConnection,
  getConnections,
  addConnection,
  updateConnection,
  testConnection,
  execApi,
  loadApp,
  saveApp,
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
      return res.status(405).end();
    }
    const { type, name, params } = req.body as RpcRequest;
    if (!hasOwnProperty(definition, type) || !hasOwnProperty(definition[type], name)) {
      // This is important to avoid RCE
      return res.status(404).end();
    }
    const method = definition[type][name];
    const context = { req, res };
    const result = await asyncLocalStorage.run(context, () => method(...params));
    return res.json({ result });
  };
}

const rpcServer = {
  query: {
    getConnections: () => {
      // DEMO: how we can add authentication in the mix:
      //   const ctx = getContext();
      //   console.log(ctx.req.headers);
      return getConnections();
    },
    getConnection,

    execApi,

    loadApp,
  },
  mutation: {
    addConnection,
    updateConnection,
    testConnection,

    saveApp,
  },
} as const;

export type ServerDefinition = typeof rpcServer;

export default createRpcHandler(rpcServer);
