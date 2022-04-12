import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'CustomLayout',
  displayName: 'CustomLayout',
  importedModule: '/runtime/components.js',
  importedName: 'CustomLayout',
  argTypes: {
    child3: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
  },
} as ToolpadComponentDefinition;
