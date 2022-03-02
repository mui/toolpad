import * as React from 'react';
import { useQuery } from 'react-query';
async function fetchData(dataUrl, queryId, params) {
    const url = new URL(`./${encodeURIComponent(queryId)}`, new URL(dataUrl, window.location.href));
    url.searchParams.set('params', JSON.stringify(params));
    const res = await fetch(String(url));
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} while fetching "${url}"`);
    }
    return res.json();
}
export const INITIAL_DATA_QUERY = {
    loading: false,
    error: null,
    data: null,
    columns: [],
    rows: [],
};
const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};
export function useDataQuery(setResult, dataUrl, queryId, params) {
    const { isLoading: loading, error, data: responseData = EMPTY_OBJECT, } = useQuery([dataUrl, queryId, params], () => queryId && fetchData(dataUrl, queryId, params), {
        enabled: !!queryId,
    });
    const { fields, data } = responseData;
    const rows = Array.isArray(data) ? data : EMPTY_ARRAY;
    const columns = React.useMemo(() => fields
        ? Object.entries(fields).map(([field, def]) => ({
            ...def,
            field,
        }))
        : [], [fields]);
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
