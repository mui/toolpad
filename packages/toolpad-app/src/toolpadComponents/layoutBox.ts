import { BoxProps } from '@mui/material';
import { ArgTypeDefinition } from '@mui/toolpad-core';

export const LAYOUT_DIRECTION_HORIZONTAL = 'horizontal';
export const LAYOUT_DIRECTION_VERTICAL = 'vertical';
export const LAYOUT_DIRECTION_BOTH = 'both';

const layoutBoxHorizontalAlignArgTypeDef: ArgTypeDefinition<BoxProps['justifyContent']> = {
  typeDef: {
    type: 'string',
    enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
  },
  label: 'Horizontal alignment',
  control: { type: 'HorizontalAlign' },
  defaultValue: 'start',
};

const layoutBoxVerticalAlignArgTypeDef: ArgTypeDefinition<BoxProps['alignItems']> = {
  typeDef: {
    type: 'string',
    enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
  },
  label: 'Vertical alignment',
  control: { type: 'VerticalAlign' },
  defaultValue: 'center',
};

export const layoutBoxArgTypes = {
  layoutHorizontalAlign: layoutBoxHorizontalAlignArgTypeDef,
  layoutVerticalAlign: layoutBoxVerticalAlignArgTypeDef,
};
