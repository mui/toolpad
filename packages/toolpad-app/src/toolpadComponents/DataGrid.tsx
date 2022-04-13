import { URI_DATAGRID_COLUMNS, URI_DATAGRID_ROWS, URI_DATAQUERY } from '../schemas';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'DataGrid',
  displayName: 'DataGrid',
  importedModule: '@mui/toolpad-components',
  importedName: 'DataGrid',
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
      typeDef: { type: 'string', enum: ['compact', 'standard', 'comfortable'] },
    },
    sx: {
      typeDef: { type: 'object' },
    },
    selection: {
      typeDef: { type: 'object' },
      onChangeProp: 'onSelectionChange',
    },
  },
} as ToolpadComponentDefinition;
