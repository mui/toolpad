import type {
  Definition,
  Methods,
  RpcRequest,
  RpcResponse,
  ServerDefinition,
} from '../pages/api/rpc';

function createResolver(endpoint: string, type: 'query' | 'mutation'): Methods {
  return new Proxy(
    {},
    {
      get(target, prop) {
        return async (...params: any[]) => {
          const body: RpcRequest = {
            type,
            name: prop as string,
            params,
          };
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify(body),
          });
          if (res.ok) {
            const { result } = (await res.json()) as RpcResponse;
            return result;
          }
          throw new Error(`HTTP ${res.status}`);
        };
      },
    },
  );
}

function createClient<D extends Definition>(endpoint: string): D {
  return {
    query: createResolver(endpoint, 'query'),
    mutation: createResolver(endpoint, 'mutation'),
  } as D;
}

export default createClient<ServerDefinition>('/api/rpc');
