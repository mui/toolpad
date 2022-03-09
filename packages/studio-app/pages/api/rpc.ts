import { NextApiHandler } from 'next';
import type { IncomingMessage } from 'http';
import {
  testConnection,
  execApi,
  loadDom,
  saveDom,
  createRelease,
  deleteRelease,
  getReleases,
  loadReleaseDom,
  createDeployment,
  findActiveDeployment,
} from '../../src/server/data';
import { hasOwnProperty } from '../../src/utils/collections';
import { Capabilities, getCapabilities } from '../../src/capabilities';

interface RpcContext {
  req: IncomingMessage;
}

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
  [K in keyof R]: (...params: Parameters<R[K]>[0]) => ReturnType<R[K]>;
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
    const method: MethodResolver<any> = definition[type][name];
    const context = { req, res };
    const result = await method(params, context);
    const responseData: RpcResponse = { result };
    res.json(responseData);
  };
}

interface MethodResolver<F extends Method> {
  (params: Parameters<F>, ctx: RpcContext): ReturnType<F>;
}

function createMethod<F extends Method>(handler: MethodResolver<F>): MethodResolver<F> {
  return handler;
}

const rpcServer = {
  query: {
    getCapabilities: createMethod<() => Promise<Capabilities | null>>(async (params, ctx) => {
      return getCapabilities(ctx.req);
    }),
    execApi: createMethod<typeof execApi>(async (params, ctx) => {
      const capabilities = await getCapabilities(ctx.req);
      if (!capabilities?.view) {
        throw new Error(`Unauthorized`);
      }
      return execApi(...params);
    }),
    getReleases: createMethod<typeof getReleases>(async (params, ctx) => {
      const capabilities = await getCapabilities(ctx.req);
      if (!capabilities?.view) {
        throw new Error(`Unauthorized`);
      }
      return getReleases(...params);
    }),
    findActiveDeployment: createMethod<typeof findActiveDeployment>(async (params, ctx) => {
      const capabilities = await getCapabilities(ctx.req);
      if (!capabilities?.view) {
        throw new Error(`Unauthorized`);
      }
      return findActiveDeployment(...params);
    }),
    loadReleaseDom: createMethod<typeof loadReleaseDom>(async (params, ctx) => {
      const capabilities = await getCapabilities(ctx.req);
      if (!capabilities?.view) {
        throw new Error(`Unauthorized`);
      }
      return loadReleaseDom(...params);
    }),
    loadDom: createMethod<typeof loadDom>(async (params, ctx) => {
      const capabilities = await getCapabilities(ctx.req);
      if (!capabilities?.view) {
        throw new Error(`Unauthorized`);
      }
      return loadDom(...params);
    }),
  },
  mutation: {
    createRelease: createMethod<typeof createRelease>(async (params, ctx) => {
      const capabilities = await getCapabilities(ctx.req);
      if (!capabilities?.edit) {
        throw new Error(`Unauthorized`);
      }
      return createRelease(...params);
    }),
    deleteRelease: createMethod<typeof deleteRelease>(async (params, ctx) => {
      const capabilities = await getCapabilities(ctx.req);
      if (!capabilities?.edit) {
        throw new Error(`Unauthorized`);
      }
      return deleteRelease(...params);
    }),
    createDeployment: createMethod<typeof createDeployment>(async (params, ctx) => {
      const capabilities = await getCapabilities(ctx.req);
      if (!capabilities?.edit) {
        throw new Error(`Unauthorized`);
      }
      return createDeployment(...params);
    }),
    testConnection: createMethod<typeof testConnection>(async (params, ctx) => {
      const capabilities = await getCapabilities(ctx.req);
      if (!capabilities?.edit) {
        throw new Error(`Unauthorized`);
      }
      return testConnection(...params);
    }),
    saveDom: createMethod<typeof saveDom>(async (params, ctx) => {
      const capabilities = await getCapabilities(ctx.req);
      if (!capabilities?.edit) {
        throw new Error(`Unauthorized`);
      }
      return saveDom(...params);
    }),
  },
} as const;

export type ServerDefinition = MethodsOf<typeof rpcServer>;

export default createRpcHandler(rpcServer);
