import { URI_DATAGRID_COLUMNS, URI_DATAGRID_ROWS, URI_DATAQUERY } from '../schemas';
import { StudioComponentDefinition } from '../types';
import importedComponentRenderer from './importedComponentRenderer';

export default {
  id: 'DataGrid',
  displayName: 'DataGrid',
  render: importedComponentRenderer('@mui/studio-components', 'DataGrid'),
  argTypes: {
    rows: {
      typeDef: { type: 'array', schema: URI_DATAGRID_ROWS as string },
    },
    columns: {
      typeDef: { type: 'array', schema: URI_DATAGRID_COLUMNS as string },
      control: { type: 'GridColumns' },
      memoize: true,
    },
    dataQuery: {
      typeDef: { type: 'object', schema: URI_DATAQUERY as string },
    },
    density: {
      typeDef: { type: 'string', enum: ['comfortable', 'compact', 'standard'] },
    },
  },
} as StudioComponentDefinition;
