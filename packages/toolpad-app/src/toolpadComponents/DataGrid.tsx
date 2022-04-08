import { DataGrid } from '@mui/toolpad-components';
import { URI_DATAGRID_COLUMNS, URI_DATAGRID_ROWS, URI_DATAQUERY } from '../schemas';
import { ToolpadComponentDefinition } from './componentDefinition';
import importedComponentRenderer from './importedComponentRenderer';
import addDefaultProps from './addDefaultProps';

export default {
  id: 'DataGrid',
  displayName: 'DataGrid',
  render: importedComponentRenderer('@mui/toolpad-components', 'DataGrid'),
  Component: addDefaultProps(DataGrid, {
    selection: null,
  }),
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
      defaultValue: null,
    },
  },
} as ToolpadComponentDefinition;
