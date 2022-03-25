import importedComponentRenderer from './importedComponentRenderer';
import { StudioComponentDefinition } from './studioComponentDefinition';

export default {
  id: 'CustomLayout',
  displayName: 'CustomLayout',
  render: importedComponentRenderer('@mui/toolpad-components', 'CustomLayout'),
  argTypes: {
    child3: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
  },
} as StudioComponentDefinition;
