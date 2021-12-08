import { DataGridProps } from '@mui/x-data-grid';
import type { StudioComponentDefinition } from '../types';

interface DataGridWithQueryProps extends DataGridProps {
  studioDataQuery: string | null;
}

const DataGrid: StudioComponentDefinition<DataGridWithQueryProps> = {
  props: {
    rows: { type: 'DataGridRows', defaultValue: [] },
    columns: {
      type: 'DataGridColumns',
      defaultValue: [],
    },
    studioDataQuery: {
      type: 'DataQuery',
      defaultValue: null,
    },
  },
  module: '@mui/studio-components',
  importedName: 'DataGrid',
};

export default DataGrid;
