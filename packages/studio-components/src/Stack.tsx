import Stack, { StackProps } from '@mui/material/Stack';
import { createComponent, FlowDirection } from '@mui/studio-core';

function getDirection({ direction }: StackProps): FlowDirection {
  return direction === 'row' ||
    direction === 'column' ||
    direction === 'row-reverse' ||
    direction === 'column-reverse'
    ? direction
    : 'column';
}

export default createComponent(Stack, {
  props: {
    gap: { type: 'number', defaultValue: 2 },
    direction: {
      type: 'Direction',
      defaultValue: 'row',
    },
    alignItems: {
      type: 'StackAlignment',
      defaultValue: 'center',
    },
    children: {
      type: 'slots',
      defaultValue: null,
      getDirection,
    },
  },
});
