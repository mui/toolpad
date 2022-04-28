import { DataGrid } from '@mui/toolpad-components';
import { TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'DataGrid',
  displayName: 'DataGrid',
  importedModule: '@mui/toolpad-components',
  importedName: 'DataGrid',
  ...DataGrid[TOOLPAD_COMPONENT],
} as ToolpadComponentDefinition;
