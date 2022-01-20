import { StudioComponentDefinition } from '../types';
import importedComponentRenderer from './importedComponentRenderer';

export default {
  id: 'DataGrid',
  displayName: 'DataGrid',
  render: importedComponentRenderer('@mui/studio-components', 'DataGrid'),
  argTypes: {
    rows: {
      typeDef: { type: 'array', items: { type: 'object' } },
      defaultValue: [],
    },
    columns: {
      typeDef: { type: 'array', items: { type: 'object' } },
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
