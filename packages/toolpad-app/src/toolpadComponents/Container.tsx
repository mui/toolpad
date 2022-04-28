import { Container } from '@mui/toolpad-components';
import { TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'Container',
  displayName: 'Container',
  importedModule: '@mui/toolpad-components',
  importedName: 'Container',
  ...Container[TOOLPAD_COMPONENT],
} as ToolpadComponentDefinition;
