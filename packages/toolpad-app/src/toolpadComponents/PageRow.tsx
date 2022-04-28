import { PageRow } from '@mui/toolpad-components';
import { TOOLPAD_COMPONENT } from '@mui/toolpad-core';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'PageRow',
  displayName: 'PageRow',
  importedModule: '@mui/toolpad-components',
  importedName: 'PageRow',
  ...PageRow[TOOLPAD_COMPONENT],
} as ToolpadComponentDefinition;
