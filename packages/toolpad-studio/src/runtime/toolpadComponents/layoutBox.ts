import { BoxProps } from '@mui/material';
import { ArgTypeDefinition } from '@toolpad/studio-runtime';

export const LAYOUT_DIRECTION_HORIZONTAL = 'horizontal';
export const LAYOUT_DIRECTION_VERTICAL = 'vertical';
export const LAYOUT_DIRECTION_BOTH = 'both';

export const layoutBoxArgTypes: {
  horizontalAlign: ArgTypeDefinition<BoxProps, 'justifyContent'>;
  verticalAlign: ArgTypeDefinition<BoxProps, 'alignItems'>;
} = {
  horizontalAlign: {
    helperText: 'Horizontal alignment of the component',
    type: 'string',
    enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
    default: 'start',
    label: 'Horizontal alignment',
    control: { type: 'HorizontalAlign', hideLabel: true },
  },
  verticalAlign: {
    helperText: 'Vertical alignment of the component.',
    type: 'string',
    enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
    default: 'start',
    label: 'Vertical alignment',
    control: { type: 'VerticalAlign', hideLabel: true },
  },
};
