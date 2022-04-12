import { Image } from '@mui/toolpad-components';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'Image',
  displayName: 'Image',
  importedModule: '@mui/toolpad-components',
  importedName: 'Image',
  Component: Image,
  argTypes: {
    src: {
      typeDef: { type: 'string' },
    },
    alt: {
      typeDef: { type: 'string' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
} as ToolpadComponentDefinition;
