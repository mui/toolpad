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
  render(context, resolvedProps) {
    context.addImport('@mui/x-data-grid', 'DataGrid', 'DataGrid');

    const { studioDataQuery, ...other } = resolvedProps;
    return `
      <div style={{ height: 350, width: '100%' }}>
        <DataGrid
          ${context.renderProps(other)}
          {...${studioDataQuery}}
        />
      </div>
    `;
  },
};

export default DataGrid;
