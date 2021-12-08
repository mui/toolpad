import * as React from 'react';

export default function useDataQuery(queryId: string, override?: object | null) {
  const [result, setResult] = React.useState({});
  const requestBody = override ? JSON.stringify(override) : null;

  React.useEffect(() => {
    if (!queryId) {
      return;
    }
    setResult({ loading: true });
    fetch(`/api/data/${queryId}`, {
      method: 'POST',
      ...(requestBody
        ? {
            body: requestBody,
          }
        : {}),
      headers: {
        'content-type': 'application/json',
      },
    }).then(
      async (res) => {
        const body = await res.json();
        if (typeof body.error === 'string') {
          setResult({ loading: false, error: body.error });
        } else if (body.result) {
          const { fields, data: rows } = body.result;
          const columns = Object.entries(fields).map(([field, def]) => ({
            ...def,
            field,
          }));

          const columnsFingerPrint = JSON.stringify(columns);
          setResult({ loading: false, rows, columns, key: columnsFingerPrint });
        } else {
          throw new Error(`Invariant: \${queryId} returned invalid result`);
        }
      },
      (error) => {
        setResult({ loading: false, error: error.message });
      },
    );
  }, [queryId, requestBody]);

  return result;
}
