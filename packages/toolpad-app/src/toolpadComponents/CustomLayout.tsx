import { CustomLayout } from '@mui/toolpad-components';
import { TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'CustomLayout',
  displayName: 'CustomLayout',
  importedModule: '@mui/toolpad-components',
  importedName: 'CustomLayout',
  ...CustomLayout[TOOLPAD_COMPONENT],
} as ToolpadComponentDefinition;
