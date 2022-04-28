import { TextField } from '@mui/toolpad-components';
import { TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'TextField',
  displayName: 'TextField',
  importedModule: '@mui/toolpad-components',
  importedName: 'TextField',
  ...TextField[TOOLPAD_COMPONENT],
} as ToolpadComponentDefinition;
