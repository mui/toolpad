import { Stack, StackProps } from '@mui/material';
import { ComponentConfig } from '@mui/toolpad-core';
import withDefaultProps from './utils/addDefaultProps';

export default withDefaultProps(Stack, {
  gap: 2,
  direction: 'row',
  alignItems: 'start',
  justifyContent: 'start',
});

export const config: ComponentConfig<StackProps> = {
  argTypes: {
    gap: {
      typeDef: { type: 'number' },
    },
    margin: {
      typeDef: { type: 'number' },
    },
    direction: {
      typeDef: {
        type: 'string',
        enum: ['row', 'row-reverse', 'column', 'column-reverse'],
      },
    },
    alignItems: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'stretch', 'baseline'],
      },
    },
    justifyContent: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
      },
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
};
