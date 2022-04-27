import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'DataGrid',
  displayName: 'DataGrid',
  importedModule: '@mui/toolpad-components',
  importedName: 'DataGrid',
  argTypes: {
    rows: {
      typeDef: { type: 'array', schema: '/schemas/DataGridRows.json' as string },
    },
    columns: {
      typeDef: { type: 'array', schema: '/schemas/DataGridColumns.json' as string },
      control: { type: 'GridColumns' },
      memoize: true,
    },
    dataQuery: {
      typeDef: { type: 'object', schema: '/schemas/DataQuery.json' as string },
    },
    density: {
      typeDef: { type: 'string', enum: ['compact', 'standard', 'comfortable'] },
    },
    sx: {
      typeDef: { type: 'object' },
    },
    selection: {
      typeDef: { type: 'object' },
      onChangeProp: 'onSelectionChange',
      defaultValue: null,
    },
  },
} as ToolpadComponentDefinition;
