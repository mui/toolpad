import { GridRowsProp } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { useQuery } from 'react-query';

async function fetchData(queryId: string) {
  const url = `/api/data/${queryId}`;
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

export default function useDataQuery(queryId: string): UseDataQuery {
  const { isLoading: loading, error, data = {} } = useQuery(queryId, () => fetchData(queryId));

  const { fields = {}, data: apiData } = data;

  const rows = Array.isArray(data.data) ? data.data : [];

  const columns = React.useMemo(
    () =>
      Object.entries(fields).map(([field, def]) => ({
        ...(def as any),
        field,
      })),
    [fields],
  );

  return {
    loading,
    error,
    data: apiData,
    columns,
    rows,
  };
}
