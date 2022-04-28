import { Typography } from '@mui/toolpad-components';
import { TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'Typography',
  displayName: 'Typography',
  importedModule: '@mui/toolpad-components',
  importedName: 'Typography',
  ...Typography[TOOLPAD_COMPONENT],
} as ToolpadComponentDefinition;
