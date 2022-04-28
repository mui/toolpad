import { Select } from '@mui/toolpad-components';
import { TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'Select',
  displayName: 'Select',
  importedModule: '@mui/toolpad-components',
  importedName: 'Select',
  ...Select[TOOLPAD_COMPONENT],
} as ToolpadComponentDefinition;
