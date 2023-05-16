import { parse as superjsonParse } from 'superjson';
import type { MethodsOf, MethodsOfGroup, RpcRequest, RpcResponse } from './server/rpc';

function createFetcher(endpoint: string, type: 'query' | 'mutation'): MethodsOfGroup<any> {
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
            const response = (await res.json()) as RpcResponse;
            if (response.error) {
              const toolpadError = new Error(response.error.message);
              if (response.error.code) {
                toolpadError.code = response.error.code;
              }
              throw toolpadError;
            }
            return superjsonParse(response.result);
          }

          throw new Error(`HTTP ${res.status}`);
        };
      },
    },
  );
}

export interface RpcClient<D extends MethodsOf<any>> {
  query: D['query'];
  mutation: D['mutation'];
}

export function createRpcClient<D extends MethodsOf<any>>(endpoint: string): RpcClient<D> {
  const query = createFetcher(endpoint, 'query');
  const mutation = createFetcher(endpoint, 'mutation');
  return { query, mutation };
}
