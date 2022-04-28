import { Button } from '@mui/toolpad-components';
import { TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'Button',
  displayName: 'Button',
  importedModule: '@mui/toolpad-components',
  importedName: 'Button',
  ...Button[TOOLPAD_COMPONENT],
} as ToolpadComponentDefinition;
