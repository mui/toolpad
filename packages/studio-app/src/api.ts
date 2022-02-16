import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import type {
  Definition,
  Methods,
  RpcRequest,
  RpcResponse,
  ServerDefinition,
} from '../pages/api/rpc';
import config from './config';

if (config.demoMode) {
  // TODO: replace API with shim based on window.localStorage
  console.log(`Starting Studio in demo mode`);
}

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

interface UseQueryFn<M extends Methods> {
  <K extends keyof M & string>(
    name: K,
    params: Parameters<M[K]>,
    options?: Omit<
      UseQueryOptions<
        Awaited<ReturnType<M[K]>>,
        unknown,
        Awaited<ReturnType<M[K]>>,
        [K, Parameters<M[K]>]
      >,
      'queryKey' | 'queryFn'
    >,
  ): UseQueryResult<Awaited<ReturnType<M[K]>>>;
}

interface UseMutationFn<M extends Methods> {
  <K extends keyof M & string>(
    name: K,
    options?: UseMutationOptions<unknown, unknown, Parameters<M[K]>>,
  ): UseMutationResult<Awaited<ReturnType<M[K]>>, unknown, Parameters<M[K]>>;
}

interface ApiClient<D extends Definition> {
  query: D['query'];
  mutation: D['mutation'];
  useQuery: UseQueryFn<D['query']>;
  useMutation: UseMutationFn<D['mutation']>;
}

function createClient<D extends Definition>(endpoint: string): ApiClient<D> {
  const query = createResolver(endpoint, 'query');
  const mutation = createResolver(endpoint, 'mutation');
  return {
    query,
    mutation,
    useQuery: (key, params, options) =>
      useQuery({
        ...options,
        queryKey: [key, params],
        queryFn: query[key],
      }),
    useMutation: (key, options) => useMutation((params) => mutation[key](...params), options),
  };
}

export default createClient<ServerDefinition>('/api/rpc');
