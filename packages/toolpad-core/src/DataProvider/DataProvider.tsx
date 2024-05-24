import { keepPreviousData, QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import invariant from 'invariant';
import * as React from 'react';
import { getObjectKey } from '@toolpad/utils/objectKey';
import { Filter, getKeyFromFilter, useAppliedFilter } from './filter';

/**
 * @ignore - do not document.
 * Not a hook nor a component
 */

export type ValidId = string | number;
export type ValidDatum = {
  id: ValidId;
  [key: string]: string | number | boolean | Date | null;
};
export type Datum<R extends ValidDatum = ValidDatum> = R;

export type ValidProp<R extends Datum> = keyof R & string;

export type FieldType = 'string' | 'number' | 'boolean' | 'date';

export interface ValueFormatter<R extends Datum, K extends ValidProp<R>> {
  (value: R[K], field: K): string;
}

export interface FieldDef<R extends Datum, K extends ValidProp<R> = ValidProp<R>> {
  type?: FieldType;
  label?: string;
  valueFormatter?: ValueFormatter<R, K>;
}

export type FieldDefs<R extends Datum> = {
  [K in Exclude<keyof R & string, 'id'>]: FieldDef<R, K>;
} & {
  id?: FieldDef<R, 'id'>;
};

export interface IndexPagination {
  start: number;
  pageSize: number;
}

export type Pagination = IndexPagination;

export interface GetManyParams<R extends Datum> {
  pagination: Pagination | null;
  filter: Filter<R>;
}

export interface GetManyResult<R extends Datum> {
  rows: R[];
  totalCount?: number;
}

export interface GetManyMethod<R extends Datum> {
  (params: GetManyParams<R>): Promise<GetManyResult<R>>;
}

export interface ResolvedField<R extends Datum, K extends ValidProp<R> = ValidProp<R>> {
  type: FieldType;
  label: string;
  valueFormatter?: ValueFormatter<R, K>;
}

export interface GetOneMethod<R extends Datum> {
  (id: ValidId): Promise<R | null>;
}

export interface CreateOneMethod<R extends Datum> {
  (data: R): Promise<R>;
}

export interface UpdateOneMethod<R extends Datum> {
  (id: ValidId, data: Partial<R>): Promise<R>;
}

export interface DeleteOneMethod {
  (id: ValidId): Promise<void>;
}

export interface DataProviderDefinition<R extends Datum> {
  getMany: GetManyMethod<R>;
  getOne?: GetOneMethod<R>;
  createOne?: CreateOneMethod<R>;
  updateOne?: UpdateOneMethod<R>;
  deleteOne?: DeleteOneMethod;
  fields?: FieldDefs<R>;
}

export type ResolvedFields<R extends Datum> = {
  [K in keyof R & string]: ResolvedField<R, K>;
};

export interface ResolvedDataProvider<R extends Datum> {
  getMany: GetManyMethod<R>;
  getOne?: GetOneMethod<R>;
  createOne?: CreateOneMethod<R>;
  updateOne?: UpdateOneMethod<R>;
  deleteOne?: DeleteOneMethod;
  fields?: ResolvedFields<R>;
}

export function createDataProvider<R extends Datum>(
  input: DataProviderDefinition<R>,
): ResolvedDataProvider<R> {
  const result = { ...input } as ResolvedDataProvider<R>;
  if (input.fields) {
    result.fields = {
      id: { label: 'id', type: 'string' },
      ...Object.fromEntries(
        Object.entries(input.fields).map(([k, v]) => [k, { type: 'string', label: k, ...v }]),
      ),
    } as ResolvedFields<R>;
  }
  return result;
}

export interface Query<R> {
  loading: boolean;
  error: Error | null;
  data?: R;
  refetch: () => void;
}

function getKeyFromPagination(pagination: Pagination): string {
  return `${pagination.start}-${pagination.pageSize}`;
}

function getKeyForParams(params: GetManyParams<any>): string[] {
  return [
    params.filter ? getKeyFromFilter(params.filter) : '',
    params.pagination ? getKeyFromPagination(params.pagination) : '',
  ];
}

const queryClient = new QueryClient();

export function useGetMany<R extends Datum>(
  dataProvider: ResolvedDataProvider<R> | null,
  params?: GetManyParams<R>,
): Query<GetManyResult<R>> {
  const providerKey = dataProvider ? getObjectKey(dataProvider) : null;
  const environmentFilter = useAppliedFilter(dataProvider);

  const resolvedParams: GetManyParams<R> = React.useMemo(() => {
    const filter = { ...environmentFilter, ...params?.filter };
    return { paginatuon: null, ...params, filter } as GetManyParams<R>;
  }, [environmentFilter, params]);

  const { data, error, isLoading, isPlaceholderData, isFetching, refetch } = useQuery(
    {
      queryKey: ['getMany', providerKey, ...getKeyForParams(resolvedParams)],
      queryFn: () => {
        invariant(dataProvider?.getMany, 'getMany not implemented');
        return dataProvider.getMany(resolvedParams);
      },
      placeholderData: keepPreviousData,
      enabled: !!dataProvider,
    },
    queryClient,
  );

  const loading = (isFetching && isPlaceholderData) || isLoading;

  return React.useMemo(() => ({ data, error, loading, refetch }), [data, error, loading, refetch]);
}

export function useGetOne<R extends Datum>(
  dataProvider: ResolvedDataProvider<R> | null,
  id: string,
): Query<R | null> {
  const key = dataProvider ? getObjectKey(dataProvider) : null;
  const {
    data = null,
    error,
    isPending: loading,
    refetch,
  } = useQuery(
    {
      queryKey: ['getOne', key, id],
      queryFn: () => {
        invariant(dataProvider?.getOne, 'getOne not implemented');
        return dataProvider.getOne(id);
      },
      enabled: !!dataProvider,
    },
    queryClient,
  );

  return React.useMemo(() => ({ data, error, loading, refetch }), [data, error, loading, refetch]);
}

export interface Mutation<F extends (...args: any[]) => Promise<any>> {
  pending: boolean;
  error: Error | null;
  mutate: F;
  reset: () => void;
}

export function useCreateOne<R extends Datum>(
  dataProvider: ResolvedDataProvider<R> | null,
): Mutation<CreateOneMethod<R>> {
  const { mutateAsync, isPending, error, reset } = useMutation(
    {
      async mutationFn(data: R) {
        if (!dataProvider) {
          throw new Error('no dataProvider available');
        }
        invariant(dataProvider.createOne, 'createOne not implemented');
        return dataProvider.createOne(data);
      },
    },
    queryClient,
  );

  return React.useMemo(
    () => ({
      pending: isPending,
      error,
      mutate: mutateAsync,
      reset,
    }),
    [isPending, error, mutateAsync, reset],
  );
}

export function useUpdateOne<R extends Datum>(
  dataProvider: ResolvedDataProvider<R> | null,
): Mutation<UpdateOneMethod<R>> {
  const { mutateAsync, error, isPending, reset } = useMutation(
    {
      async mutationFn([id, data]: Parameters<UpdateOneMethod<R>>) {
        if (!dataProvider) {
          throw new Error('no dataProvider available');
        }
        invariant(dataProvider.updateOne, 'updateOne not implemented');
        return dataProvider.updateOne(id, data);
      },
    },
    queryClient,
  );

  const mutate = React.useCallback<UpdateOneMethod<R>>(
    (id, data) => mutateAsync([id, data]),
    [mutateAsync],
  );

  return React.useMemo(
    () => ({
      pending: isPending,
      error,
      mutate,
      reset,
    }),
    [isPending, error, mutate, reset],
  );
}

export function useDeleteOne<R extends Datum>(
  dataProvider: ResolvedDataProvider<R> | null,
): Mutation<DeleteOneMethod> {
  const { mutateAsync, error, isPending, reset } = useMutation(
    {
      async mutationFn(id: ValidId) {
        if (!dataProvider) {
          throw new Error('no dataProvider available');
        }
        invariant(dataProvider.deleteOne, 'deleteOne not implemented');
        return dataProvider.deleteOne(id);
      },
    },
    queryClient,
  );

  return React.useMemo(
    () => ({
      pending: isPending,
      error,
      mutate: mutateAsync,
      reset,
    }),
    [isPending, error, mutateAsync, reset],
  );
}
