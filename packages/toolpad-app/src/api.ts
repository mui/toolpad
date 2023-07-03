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
import type { Definition, MethodsGroup, MethodsOf, ServerDefinition } from './server/rpc';
import { createRpcClient } from './rpcClient';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'always',
    },
    mutations: {
      networkMode: 'always',
    },
  },
});

export interface UseQueryFnOptions<F extends (...args: any[]) => any>
  extends Omit<
    UseQueryOptions<Awaited<ReturnType<F>>, unknown, Awaited<ReturnType<F>>, any[]>,
    'queryKey' | 'queryFn'
  > {}

interface UseQueryFn<M extends MethodsGroup> {
  <K extends keyof M & string>(
    name: K,
    params: Parameters<M[K]> | null,
    options?: UseQueryFnOptions<M[K]>,
  ): UseQueryResult<Awaited<ReturnType<M[K]>>>;
}

interface UseMutationFn<M extends MethodsGroup> {
  <K extends keyof M & string>(
    name: K,
    options?: UseMutationOptions<any, unknown, Parameters<M[K]>>,
  ): UseMutationResult<Awaited<ReturnType<M[K]>>, unknown, Parameters<M[K]>>;
}

interface RpcClient<D extends Definition> {
  query: D['query'];
  mutation: D['mutation'];
}

interface ApiClient<D extends Definition> extends RpcClient<D> {
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

function createClient<D extends MethodsOf<any>>(endpoint: string): ApiClient<D> {
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

export default createClient<ServerDefinition>('/api/rpc');
