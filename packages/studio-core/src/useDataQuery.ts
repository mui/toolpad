import { GridRowsProp } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { useQuery } from 'react-query';

async function fetchData(queryId: string, params: any) {
  const url = `/api/data/${encodeURIComponent(queryId)}?params=${encodeURIComponent(
    JSON.stringify(params),
  )}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} while fetching "${url}"`);
  }
  return res.json();
}

export interface UseDataQuery {
  loading: boolean;
  error: any;
  data: any;
  columns: { field: string }[];
  rows: GridRowsProp;
}

export const INITIAL_DATA_QUERY: UseDataQuery = {
  loading: false,
  error: null,
  data: null,
  columns: [],
  rows: [],
};

const EMPTY_ARRAY: any[] = [];
const EMPTY_OBJECT: any = {};

export function useDataQuery(
  setResult: React.Dispatch<React.SetStateAction<UseDataQuery>>,
  queryId: string | null,
  params: any,
): void {
  const {
    isLoading: loading,
    error,
    data: responseData = EMPTY_OBJECT,
  } = useQuery([queryId, params], () => queryId && fetchData(queryId, params), {
    enabled: !!queryId,
  });

  const { fields, data } = responseData;

  const rows = Array.isArray(data) ? data : EMPTY_ARRAY;

  const columns = React.useMemo(
    () =>
      fields
        ? Object.entries(fields).map(([field, def]) => ({
            ...(def as any),
            field,
          }))
        : [],
    [fields],
  );

  React.useEffect(() => {
    setResult({
      loading,
      error,
      data,
      columns,
      rows,
    });
  }, [setResult, loading, error, data, columns, rows]);
}
