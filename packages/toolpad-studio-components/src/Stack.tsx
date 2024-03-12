import { Stack } from '@mui/material';
import createBuiltin from './createBuiltin';
import { SX_PROP_HELPER_TEXT } from './constants';

export default createBuiltin(Stack, {
  helperText: 'The Material UI [Stack](https://mui.com/material-ui/react-stack/) component.',
  argTypes: {
    direction: {
      helperText: 'The flex layout direction.',
      type: 'string',
      enum: ['row', 'row-reverse', 'column', 'column-reverse'],
      default: 'row',
    },
    alignItems: {
      helperText: 'The flex layout align items.',
      type: 'string',
      enum: ['start', 'center', 'end', 'stretch', 'baseline'],
      default: 'start',
    },
    justifyContent: {
      helperText: 'The flex layout justify content.',
      type: 'string',
      enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
      default: 'start',
    },
    gap: {
      helperText: 'The gap between children.',
      type: 'number',
      default: 2,
    },
    margin: {
      helperText: 'The margin around the component.',
      type: 'number',
    },
    children: {
      helperText: 'The content of the component.',
      type: 'element',
      control: { type: 'slots' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
