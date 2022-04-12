import * as React from 'react';
import { useQuery, UseQueryResult } from 'react-query';
import { UseDataQuery } from '../../src/types';

async function fetchData(dataUrl: string, queryId: string, params: any) {
  const url = new URL(`./${encodeURIComponent(queryId)}`, new URL(dataUrl, window.location.href));
  url.searchParams.set('params', JSON.stringify(params));
  const res = await fetch(String(url));
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} while fetching "${url}"`);
  }
  return res.json();
}

export const INITIAL_DATA_QUERY: UseDataQuery = {
  loading: false,
  error: null,
  data: null,
  rows: [],
};

const EMPTY_ARRAY: any[] = [];
const EMPTY_OBJECT: any = {};

export function transformQueryResult(result: UseQueryResult): UseDataQuery {
  const { isLoading: loading, error, data: responseData = EMPTY_OBJECT } = result;

  const { data } = responseData;

  const rows = Array.isArray(data) ? data : EMPTY_ARRAY;

  return {
    loading,
    error,
    data,
    rows,
  };
}

export function useDataQuery(
  setResult: React.Dispatch<React.SetStateAction<UseDataQuery>>,
  dataUrl: string,
  queryId: string | null,
  params: any,
): void {
  const queryResult = useQuery(
    [dataUrl, queryId, params],
    () => queryId && fetchData(dataUrl, queryId, params),
    {
      enabled: !!queryId,
    },
  );

  const result = React.useMemo(() => transformQueryResult(queryResult), [queryResult]);

  React.useEffect(() => {
    setResult(result);
  }, [setResult, result]);
}
