import { URI_DATAGRID_COLUMNS, URI_DATAGRID_ROWS } from '../schemas';
import { StudioComponentDefinition } from '../types';
import importedComponentRenderer from './importedComponentRenderer';

export default {
  id: 'DataGrid',
  displayName: 'DataGrid',
  render: importedComponentRenderer('@mui/studio-components', 'DataGrid'),
  argTypes: {
    rows: {
      typeDef: { type: 'array', schema: URI_DATAGRID_ROWS as string },
      defaultValue: [],
    },
    columns: {
      typeDef: { type: 'array', schema: URI_DATAGRID_COLUMNS as string },
      defaultValue: [],
    },
    density: {
      typeDef: { type: 'string', enum: ['comfortable', 'compact', 'standard'] },
    },
    studioDataQuery: {
      typeDef: { type: 'dataQuery' },
    },
  },
} as StudioComponentDefinition;
