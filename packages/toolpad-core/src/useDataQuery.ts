import { GridRowsProp } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export async function execDataSourceQuery(dataUrl: string, queryId: string, params: any) {
  const url = new URL(`./${encodeURIComponent(queryId)}`, new URL(dataUrl, window.location.href));
  const res = await fetch(String(url), {
    method: 'POST',
    body: JSON.stringify(params),
    headers: [['content-type', 'application/json']],
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} while fetching "${url}"`);
  }
  return res.json();
}

export type UseDataQueryConfig = Pick<
  UseQueryOptions<any, unknown, unknown, any[]>,
  'enabled' | 'refetchOnWindowFocus' | 'refetchOnReconnect' | 'refetchInterval'
>;

export interface UseDataQuery {
  isLoading: boolean;
  isFetching: boolean;
  error: any;
  data: any;
  rows: GridRowsProp;
  refetch: () => void;
}

export const INITIAL_DATA_QUERY: UseDataQuery = {
  isLoading: false,
  isFetching: false,
  error: null,
  data: null,
  rows: [],
  refetch: () => {},
};

const EMPTY_ARRAY: any[] = [];
const EMPTY_OBJECT: any = {};

export function useDataQuery(
  dataUrl: string,
  queryId: string | null,
  params: any,
  {
    enabled = true,
    ...options
  }: Pick<
    UseQueryOptions<any, unknown, unknown, any[]>,
    'enabled' | 'refetchOnWindowFocus' | 'refetchOnReconnect' | 'refetchInterval'
  >,
): UseDataQuery {
  const {
    isLoading,
    isFetching,
    error: fetchError,
    data: responseData = EMPTY_OBJECT,
    refetch,
  } = useQuery(
    [dataUrl, queryId, params],
    () => queryId && execDataSourceQuery(dataUrl, queryId, params),
    {
      ...options,
      enabled: !!queryId && enabled,
    },
  );

  const { data, error: apiError } = responseData;

  const error = apiError || fetchError;

  const rows = Array.isArray(data) ? data : EMPTY_ARRAY;

  const result: UseDataQuery = React.useMemo(
    () => ({
      isLoading: isLoading && enabled,
      isFetching,
      error,
      data,
      rows,
      refetch,
    }),
    [isLoading, enabled, isFetching, error, data, rows, refetch],
  );

  return result;
}
