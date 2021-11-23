import { DataGridProps } from '@mui/x-data-grid';
import * as React from 'react';
import type { DataApiResult } from '../../../pages/api/data/[queryId]';
import { useCurrentPage } from './PageContext';

// TODO: is there a built-in type for this?
interface DataQueryResult extends Partial<DataGridProps> {
  key?: string;
}

export function useDataQuery(queryId: string | null): DataQueryResult {
  const [result, setResult] = React.useState<DataQueryResult>({});
  const page = useCurrentPage();

  React.useEffect(() => {
    if (!queryId) {
      return;
    }
    const query = page.queries[queryId];
    if (!query) {
      return;
    }
    setResult({ loading: true });
    fetch(`/api/data/${queryId}`, {
      method: 'POST',
      body: JSON.stringify(query),
      headers: {
        'content-type': 'application/json',
      },
    }).then(
      async (res) => {
        const body = (await res.json()) as DataApiResult<any>;
        if (typeof body.error === 'string') {
          setResult({ loading: false, error: body.error });
        } else if (body.result) {
          const { fields, data: rows } = body.result;
          const columns = (Object.entries(fields) as [string, object][]).map(([field, def]) => ({
            ...def,
            field,
          }));

          /*
          from the docs:
          https://mui.com/components/data-grid/columns/#column-definitions
      
          > ⚠️ The columns prop should keep the same reference between two renders. 
          > The columns are designed to be definitions, to never change once the 
          > component is mounted. Otherwise, you take the risk of losing the column 
          > width state (if resized). You can create the array outside of the render 
          > function or memoize it.
      
          Updating columns asynchronously doesn't work and doesn't seem to be intended
          https://codesandbox.io/s/fixedsizegrid-material-demo-forked-rly0u?file=/demo.tsx
      
          Just forcing a remount when the column array changes to make it accept the new columns.
          This should probably be looked at to support out of the box.

          TODO: if not fixed in mui, move serverside
        */
          const columnsFingerPrint = JSON.stringify(columns);
          setResult({ loading: false, rows, columns, key: columnsFingerPrint });
        } else {
          throw new Error(`Invariant: ${queryId} returned invalid result`);
        }
      },
      (error) => {
        setResult({ loading: false, error: error.message });
      },
    );
  }, [queryId, page]);

  return result;
}
