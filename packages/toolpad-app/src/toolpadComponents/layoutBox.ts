import { BoxProps } from '@mui/material';
import { ArgTypeDefinition } from '@mui/toolpad-core';

export const layoutBoxAlignArgTypeDef: ArgTypeDefinition<BoxProps['alignItems']> = {
  typeDef: {
    type: 'string',
    enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
  },
  label: 'Box vertical alignment',
  control: { type: 'VerticalAlign' },
  defaultValue: 'center',
};

export const layoutBoxJustifyArgTypeDef: ArgTypeDefinition<BoxProps['justifyContent']> = {
  typeDef: {
    type: 'string',
    enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
  },
  label: 'Box horizontal alignment',
  control: { type: 'HorizontalAlign' },
  defaultValue: 'start',
};
