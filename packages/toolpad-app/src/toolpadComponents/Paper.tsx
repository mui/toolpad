import { Paper } from '@mui/toolpad-components';
import { TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'Paper',
  displayName: 'Paper',
  importedModule: '@mui/toolpad-components',
  importedName: 'Paper',
  ...Paper[TOOLPAD_COMPONENT],
} as ToolpadComponentDefinition;
