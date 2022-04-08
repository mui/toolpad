import { Stack } from '@mui/material';
import { ToolpadComponentDefinition } from './componentDefinition';
import importedComponentRenderer from './importedComponentRenderer';
import wrapWithDefaultProps from './WrapWithDefaultProps';

export default {
  id: 'Stack',
  displayName: 'Stack',
  render: importedComponentRenderer('@mui/material', 'Stack'),
  Component: wrapWithDefaultProps(Stack, {
    gap: 2,
    direction: 'row',
    alignItems: 'start',
    justifyContent: 'start',
  }),
  argTypes: {
    gap: {
      typeDef: { type: 'number' },
      defaultValue: 2,
    },
    margin: {
      typeDef: { type: 'number' },
    },
    direction: {
      typeDef: {
        type: 'string',
        enum: ['row', 'row-reverse', 'column', 'column-reverse'],
      },
      defaultValue: 'row',
    },
    alignItems: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'stretch', 'baseline'],
      },
      defaultValue: 'start',
    },
    justifyContent: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
      },
      defaultValue: 'start',
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
} as ToolpadComponentDefinition;
