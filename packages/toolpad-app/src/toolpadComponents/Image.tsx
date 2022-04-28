import { Image } from '@mui/toolpad-components';
import { TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'Image',
  displayName: 'Image',
  importedModule: '@mui/toolpad-components',
  importedName: 'Image',
  ...Image[TOOLPAD_COMPONENT],
} as ToolpadComponentDefinition;
