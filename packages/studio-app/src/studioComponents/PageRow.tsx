import importedComponentRenderer from './importedComponentRenderer';
import { StudioComponentDefinition } from './studioComponentDefinition';

export default {
  id: 'PageRow',
  displayName: 'PageRow',
  render: importedComponentRenderer('@mui/studio-components', 'PageRow'),
  argTypes: {
    spacing: {
      typeDef: { type: 'number' },
      defaultValue: 2,
    },
    alignItems: {
      typeDef: {
        type: 'string',
        enum: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
      },
      defaultValue: 'flex-start',
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
  },
} as StudioComponentDefinition;
