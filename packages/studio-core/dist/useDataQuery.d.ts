import { GridRowsProp } from '@mui/x-data-grid-pro';
import * as React from 'react';
export interface UseDataQuery {
    loading: boolean;
    error: any;
    data: any;
    columns: {
        field: string;
    }[];
    rows: GridRowsProp;
}
export declare const INITIAL_DATA_QUERY: UseDataQuery;
export declare function useDataQuery(setResult: React.Dispatch<React.SetStateAction<UseDataQuery>>, dataUrl: string, queryId: string | null, params: any): void;
