import * as superjson from 'superjson';
import invariant from 'invariant';
import {
  QueryClient,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
} from '@tanstack/react-query';
import type { MethodsOf, RpcRequest, RpcResponse, MethodResolvers, Methods } from './server/rpc';

function createRpcClient<D extends MethodResolvers>(endpoint: string | URL): MethodsOf<D> {
  return new Proxy({} as MethodsOf<D>, {
    get(target, prop) {
      return async (...params: any[]) => {
        const body: RpcRequest = {
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
          return superjson.parse(response.result);
        }

        throw new Error(`HTTP ${res.status}`);
      };
    },
  });
}

export type RpcClient<D extends MethodResolvers> = MethodsOf<D>;

export interface UseQueryFnOptions<F extends (...args: any[]) => any>
  extends Omit<
    UseQueryOptions<Awaited<ReturnType<F>>, Error, Awaited<ReturnType<F>>, any[]>,
    'queryKey' | 'queryFn'
  > {}

export interface UseSuspenseQueryFnOptions<F extends (...args: any[]) => any>
  extends Omit<
    UseSuspenseQueryOptions<Awaited<ReturnType<F>>, Error, Awaited<ReturnType<F>>, any[]>,
    'queryKey' | 'queryFn'
  > {}

export interface UseQueryFn<M extends Methods> {
  <K extends keyof M & string>(
    name: K,
    params: Parameters<M[K]> | null,
    options?: UseQueryFnOptions<M[K]>,
  ): UseQueryResult<Awaited<ReturnType<M[K]>>>;
}

export interface UseSuspenseQueryFn<M extends Methods> {
  <K extends keyof M & string>(
    name: K,
    params: Parameters<M[K]> | null,
    options?: UseSuspenseQueryFnOptions<M[K]>,
  ): UseSuspenseQueryResult<Awaited<ReturnType<M[K]>>>;
}

export interface UseMutationFn<M extends Methods> {
  <K extends keyof M & string>(
    name: K,
    options?: UseMutationOptions<any, Error, Parameters<M[K]>>,
  ): UseMutationResult<Awaited<ReturnType<M[K]>>, Error, Parameters<M[K]>>;
}

export interface ApiClient<D extends MethodResolvers, M extends Methods = MethodsOf<D>> {
  methods: M;
  useQuery: UseQueryFn<M>;
  useSuspenseQuery: UseSuspenseQueryFn<M>;
  useMutation: UseMutationFn<M>;
  refetchQueries: <K extends keyof M>(key: K, params: Parameters<M[K]>) => Promise<void>;
  invalidateQueries: <K extends keyof M>(key: K, params: Parameters<M[K]>) => Promise<void>;
}

export function createRpcApi<D extends MethodResolvers>(
  queryClient: QueryClient,
  endpoint: string | URL,
): ApiClient<D> {
  const methods = createRpcClient<D>(endpoint);

  return {
    methods,
    useQuery: (key, params, options) => {
      return useQuery({
        ...options,
        enabled: !!params && options?.enabled !== false,
        queryKey: [key, params],
        queryFn: () => {
          invariant(params, `"enabled" prop of useQuery should prevent this call'`);
          return methods[key](...params);
        },
      });
    },
    useSuspenseQuery: (key, params, options) => {
      return useSuspenseQuery({
        ...options,
        queryKey: [key, params],
        queryFn: () => {
          invariant(params, 'Query has no parameters');
          return methods[key](...params);
        },
      });
    },
    useMutation: (key, options) =>
      useMutation({ mutationFn: (params) => methods[key](...params), ...options }),
    refetchQueries(key, params?) {
      return queryClient.refetchQueries({ queryKey: [key, params] });
    },
    invalidateQueries(key, params) {
      return queryClient.invalidateQueries({ queryKey: [key, params] });
    },
  };
}
