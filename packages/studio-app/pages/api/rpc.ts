import { NextApiHandler } from 'next';
import { AsyncLocalStorage } from 'async_hooks';
import type { IncomingMessage, ServerResponse } from 'http';
import {
  getConnection,
  getConnections,
  addConnection,
  updateConnection,
  testConnection,
  getApis,
  getApi,
  addApi,
  updateApi,
  execApi,
  loadApp,
  saveApp,
} from '../../src/server/data';

const DEFAULT_CONTEXT = {};

const asyncLocalStorage = new AsyncLocalStorage<NextRpcContext>();

export function getContext(): NextRpcContext {
  return asyncLocalStorage.getStore() || DEFAULT_CONTEXT;
}

interface NextRpcContext {
  req?: IncomingMessage;
  res?: ServerResponse;
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
    const method = definition[type][name];
    if (!method) {
      return res.status(404).end();
    }
    const context = { req, res };
    const result = await asyncLocalStorage.run(context, () => method(...params));
    return res.json({ result });
  };
}

const rpcServer = {
  query: {
    getConnections,
    getConnection,

    getApis,
    getApi,
    execApi,

    loadApp,
  },
  mutation: {
    addConnection,
    updateConnection,
    testConnection,

    addApi,
    updateApi,

    saveApp,
  },
} as const;

export type ServerDefinition = typeof rpcServer;

export default createRpcHandler(rpcServer);
