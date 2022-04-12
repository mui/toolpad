import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'Image',
  displayName: 'Image',
  importedModule: '/runtime/components.js',
  importedName: 'Image',
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
