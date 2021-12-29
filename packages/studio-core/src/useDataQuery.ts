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
  columns: { field: string }[];
  rows: any[];
  key: string;
}

export default function useDataQuery(queryId: string): UseDataQuery {
  const { isLoading: loading, data = {} } = useQuery(queryId, () => fetchData(queryId));

  const { fields = {}, data: rows = [] } = data;

  const columns = React.useMemo(
    () =>
      Object.entries(fields).map(([field, def]) => ({
        ...(def as any),
        field,
      })),
    [fields],
  );

  const columnsFingerPrint = React.useMemo(() => JSON.stringify(columns), [columns]);

  return {
    loading,
    columns,
    rows,
    key: columnsFingerPrint,
  };
}
