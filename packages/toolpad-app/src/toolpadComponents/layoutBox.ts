import { BoxProps } from '@mui/material';
import { ArgTypeDefinition } from '@mui/toolpad-core';

export const LAYOUT_DIRECTION_HORIZONTAL = 'horizontal';
export const LAYOUT_DIRECTION_VERTICAL = 'vertical';
export const LAYOUT_DIRECTION_BOTH = 'both';

export const layoutBoxArgTypes: {
  height: ArgTypeDefinition<number>;
  horizontalAlign: ArgTypeDefinition<BoxProps['justifyContent']>;
  verticalAlign: ArgTypeDefinition<BoxProps['alignItems']>;
} = {
  height: {
    typeDef: { type: 'string' },
    defaultValue: 'auto',
  },
  horizontalAlign: {
    typeDef: {
      type: 'string',
      enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
    },
    label: 'Horizontal alignment',
    control: { type: 'HorizontalAlign' },
    defaultValue: 'start',
  },
  verticalAlign: {
    typeDef: {
      type: 'string',
      enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
    },
    label: 'Vertical alignment',
    control: { type: 'VerticalAlign' },
    defaultValue: 'center',
  },
};
