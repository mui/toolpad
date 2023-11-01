import * as React from 'react';
import { Box, BoxProps } from '@mui/material';
import createBuiltin from './createBuiltin';
import { SX_PROP_HELPER_TEXT } from './constants';

function Spacer(props: BoxProps) {
  return <Box {...props} height="100%" />;
}

export default createBuiltin(Spacer, {
  helperText: 'Spacer component.\nIt allows for creating space between elements.',
  defaultLayoutHeight: 40,
  minimumLayoutHeight: 4,
  argTypes: {
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
