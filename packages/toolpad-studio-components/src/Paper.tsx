import * as React from 'react';
import { Paper as MuiPaper, PaperProps as MuiPaperProps } from '@mui/material';
import createBuiltin from './createBuiltin';
import { SX_PROP_HELPER_TEXT } from './constants';

function Paper({ children, sx, ...rest }: MuiPaperProps) {
  return (
    <MuiPaper sx={{ padding: 1, width: '100%', ...sx }} {...rest}>
      {children}
    </MuiPaper>
  );
}

export default createBuiltin(Paper, {
  helperText: 'The Material UI [Paper](https://mui.com/material-ui/react-paper/) component.',
  layoutDirection: 'vertical',
  argTypes: {
    elevation: {
      helperText:
        'The [elevation](https://mui.com/material-ui/react-paper/#elevation) can be used to establish a hierarchy between other content. In practical terms, the elevation controls the size of the shadow applied to the surface. In dark mode, raising the elevation also makes the surface lighter.',
      type: 'number',
      minimum: 0,
      default: 1,
    },
    children: {
      helperText: 'The content of the component.',
      type: 'element',
      control: { type: 'layoutSlot' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
