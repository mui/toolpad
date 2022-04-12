import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'Button',
  displayName: 'Button',
  importedModule: '/runtime/components.js',
  importedName: 'Button',
  argTypes: {
    children: {
      name: 'content',
      typeDef: { type: 'string' },
    },
    disabled: {
      typeDef: { type: 'boolean' },
    },
    variant: {
      typeDef: { type: 'string', enum: ['contained', 'outlined', 'text'] },
    },
    color: {
      typeDef: { type: 'string', enum: ['primary', 'secondary'] },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
} as ToolpadComponentDefinition;
