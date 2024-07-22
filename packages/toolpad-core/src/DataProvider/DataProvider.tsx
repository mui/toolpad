import { keepPreviousData, QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import * as React from 'react';
import { getObjectKey } from '@toolpad/utils/objectKey';
import { deepmerge } from '@mui/utils';
import { type Filter, FilterProvider, getKeyFromFilter, useFilter } from './filter';

export { type Filter, useFilter } from './filter';

/**
 * @ignore - do not document.
 * Not a hook nor a component
 */

export const DEFAULT_ID_FIELD = 'id';
export type DefaultIdField = typeof DEFAULT_ID_FIELD;

export type ValidId = string | number;
export type ValidDatum = {
  id: ValidId;
  [key: string]: string | number | boolean | Date | null;
};
export type Datum<R extends ValidDatum = ValidDatum> = R;

export type FieldOf<R extends Datum> = keyof R & string;

export type FieldType = 'string' | 'number' | 'boolean' | 'date';

export interface ValueFormatter<R extends Datum, K extends FieldOf<R>> {
  (value: R[K], field: K): string;
}

export interface FieldDef<R extends Datum, K extends FieldOf<R> = FieldOf<R>> {
  type?: FieldType;
  label?: string;
  valueFormatter?: ValueFormatter<R, K>;
}

export type FieldDefs<R extends Datum> = {
  [K in Exclude<FieldOf<R>, DefaultIdField>]: FieldDef<R, K>;
} & {
  id?: FieldDef<R, DefaultIdField>;
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
  rowCount?: number;
}

export interface GetManyMethod<R extends Datum> {
  (params: GetManyParams<R>): Promise<GetManyResult<R>>;
}

export interface ResolvedField<R extends Datum, K extends FieldOf<R> = FieldOf<R>> {
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
  idField?: FieldOf<R>;
  fields?: FieldDefs<R>;
}

export type ResolvedFields<R extends Datum> = { [K in FieldOf<R>]: ResolvedField<R, K> };

export interface ResolvedDataProvider<R extends Datum> {
  getMany: GetManyMethod<R>;
  getOne?: GetOneMethod<R>;
  createOne?: CreateOneMethod<R>;
  updateOne?: UpdateOneMethod<R>;
  deleteOne?: DeleteOneMethod;
  idField?: FieldOf<R>;
  fields?: ResolvedFields<R>;
}

export function createDataProvider<R extends Datum>(
  input: DataProviderDefinition<R>,
): ResolvedDataProvider<R> {
  const result = { ...input } as ResolvedDataProvider<R>;
  if (input.fields) {
    result.fields = {
      [input.idField ?? DEFAULT_ID_FIELD]: { type: 'string' },
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      networkMode: 'always',
    },
    mutations: {
      networkMode: 'always',
    },
  },
});

export function useGetMany<R extends Datum>(
  dataProvider: ResolvedDataProvider<R> | null,
  params?: GetManyParams<R>,
): Query<GetManyResult<R>> {
  const providerKey = dataProvider ? getObjectKey(dataProvider) : null;
  const environmentFilter = useFilter();

  const resolvedParams: GetManyParams<R> = React.useMemo(() => {
    const filter = deepmerge({} as Filter<R>, environmentFilter, params?.filter ?? {});
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

export interface DataContextProps {
  filter?: Filter<any>;
  children?: React.ReactNode;
}

const defaultFilter: Filter<any> = {};

function DataContext(props: DataContextProps) {
  const { filter = defaultFilter, children } = props;

  return <FilterProvider value={filter}>{children}</FilterProvider>;
}

DataContext.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  children: PropTypes.node,
  filter: PropTypes.object,
} as any;

export { DataContext };
