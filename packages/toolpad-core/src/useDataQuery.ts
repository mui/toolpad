import { GridRowsProp } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { useQuery } from 'react-query';

async function fetchData(dataUrl: string, queryId: string, params: any) {
  const url = new URL(`./${encodeURIComponent(queryId)}`, new URL(dataUrl, window.location.href));
  url.searchParams.set('params', JSON.stringify(params));
  const res = await fetch(String(url));
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} while fetching "${url}"`);
  }
  return res.json();
}

export interface UseDataQuery {
  loading: boolean;
  error: any;
  data: any;
  rows: GridRowsProp;
  refetch: () => void;
}

export const INITIAL_DATA_QUERY: UseDataQuery = {
  loading: false,
  error: null,
  data: null,
  rows: [],
  refetch: () => {},
};

const EMPTY_ARRAY: any[] = [];
const EMPTY_OBJECT: any = {};

export function useDataQuery(
  setResult: React.Dispatch<React.SetStateAction<UseDataQuery>>,
  dataUrl: string,
  queryId: string | null,
  params: any,
): void {
  const {
    isLoading: loading,
    error,
    data: responseData = EMPTY_OBJECT,
    refetch,
  } = useQuery([dataUrl, queryId, params], () => queryId && fetchData(dataUrl, queryId, params), {
    enabled: !!queryId,
  });

  const { data } = responseData;

  const rows = Array.isArray(data) ? data : EMPTY_ARRAY;

  const result: UseDataQuery = React.useMemo(
    () => ({
      loading,
      error,
      data,
      rows,
      refetch,
    }),
    [loading, error, data, rows, refetch],
  );

  React.useEffect(() => {
    setResult(result);
  }, [setResult, result]);
}
