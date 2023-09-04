import { parse as superjsonParse } from 'superjson';
import invariant from 'invariant';
import {
  QueryClient,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import type {
  MethodsOf,
  MethodsOfGroup,
  RpcRequest,
  RpcResponse,
  Definition,
  MethodsGroup,
} from './server/rpc';

function createFetcher(endpoint: string | URL, type: 'query' | 'mutation'): MethodsOfGroup<any> {
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
              const toolpadError = new Error(response.error.message, {
                cause: response.error,
              });
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

export function createRpcClient<D extends MethodsOf<any>>(endpoint: string | URL): RpcClient<D> {
  const query = createFetcher(endpoint, 'query');
  const mutation = createFetcher(endpoint, 'mutation');
  return { query, mutation };
}

export interface UseQueryFnOptions<F extends (...args: any[]) => any>
  extends Omit<
    UseQueryOptions<Awaited<ReturnType<F>>, unknown, Awaited<ReturnType<F>>, any[]>,
    'queryKey' | 'queryFn'
  > {}

export interface UseQueryFn<M extends MethodsGroup> {
  <K extends keyof M & string>(
    name: K,
    params: Parameters<M[K]> | null,
    options?: UseQueryFnOptions<M[K]>,
  ): UseQueryResult<Awaited<ReturnType<M[K]>>>;
}

export interface UseMutationFn<M extends MethodsGroup> {
  <K extends keyof M & string>(
    name: K,
    options?: UseMutationOptions<any, unknown, Parameters<M[K]>>,
  ): UseMutationResult<Awaited<ReturnType<M[K]>>, unknown, Parameters<M[K]>>;
}

export interface RpcPiClient<D extends Definition> {
  query: D['query'];
  mutation: D['mutation'];
}

export interface ApiClient<D extends Definition> extends RpcPiClient<D> {
  query: D['query'];
  mutation: D['mutation'];
  useQuery: UseQueryFn<D['query']>;
  useMutation: UseMutationFn<D['mutation']>;
  refetchQueries: <K extends keyof D['query']>(
    key: K,
    params?: Parameters<D['query'][K]>,
  ) => Promise<void>;
  invalidateQueries: <K extends keyof D['query']>(
    key: K,
    params?: Parameters<D['query'][K]>,
  ) => Promise<void>;
}

export function createRpcApi<D extends MethodsOf<any>>(
  queryClient: QueryClient,
  endpoint: string | URL,
): ApiClient<D> {
  const { query, mutation } = createRpcClient<D>(endpoint);

  return {
    query,
    mutation,
    useQuery: (key, params, options) => {
      return useQuery({
        ...options,
        enabled: !!params && options?.enabled !== false,
        queryKey: [key, params],
        queryFn: () => {
          invariant(params, `"enabled" prop of useQuery should prevent this call'`);
          return query[key](...params);
        },
      });
    },
    useMutation: (key, options) => useMutation((params) => mutation[key](...params), options),
    refetchQueries(key, params?) {
      return queryClient.refetchQueries(params ? [key, params] : [key]);
    },
    invalidateQueries(key, params?) {
      return queryClient.invalidateQueries(params ? [key, params] : [key]);
    },
  };
}
