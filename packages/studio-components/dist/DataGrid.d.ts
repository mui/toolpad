import { DataGridProProps, GridColumns, GridRowsProp } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { UseDataQuery } from 'packages/studio-core/dist/useDataQuery';
interface DataGridWithQueryProps extends Omit<DataGridProProps, 'columns' | 'rows'> {
    rows?: GridRowsProp;
    columns?: GridColumns;
    dataQuery?: UseDataQuery;
}
declare const DataGridComponent: React.ForwardRefExoticComponent<DataGridWithQueryProps & React.RefAttributes<HTMLDivElement>>;
export default DataGridComponent;
