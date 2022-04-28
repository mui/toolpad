import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'DataGrid',
  displayName: 'DataGrid',
  importedModule: '@mui/toolpad-components',
  importedName: 'DataGrid',
  argTypes: {
    rows: {
      typeDef: { type: 'array', schema: '/schemas/DataGridRows.json' },
    },
    columns: {
      typeDef: { type: 'array', schema: '/schemas/DataGridColumns.json' },
      control: { type: 'GridColumns' },
      memoize: true,
    },
    dataQuery: {
      typeDef: { type: 'object', schema: '/schemas/DataQuery.json' },
    },
    density: {
      typeDef: { type: 'string', enum: ['compact', 'standard', 'comfortable'] },
    },
    sx: {
      typeDef: { type: 'object' },
    },
    rowIdFieldProp: {
      typeDef: { type: 'string' },
    },
    selection: {
      typeDef: { type: 'object' },
      onChangeProp: 'onSelectionChange',
    },
  },
} as ToolpadComponentDefinition;
