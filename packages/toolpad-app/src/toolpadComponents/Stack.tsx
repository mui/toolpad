import { Stack } from '@mui/toolpad-components';
import { TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'Stack',
  displayName: 'Stack',
  importedModule: '@mui/toolpad-components',
  importedName: 'Stack',
  ...Stack[TOOLPAD_COMPONENT],
} as ToolpadComponentDefinition;
