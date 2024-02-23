import * as React from 'react';
import { Box, BoxProps } from '@mui/material';
import createBuiltin from './createBuiltin';
import { SX_PROP_HELPER_TEXT } from './constants';

const SPACER_MINIMUM_HEIGHT = 60; // pixels

function Spacer(props: BoxProps) {
  return <Box {...props} height="100%" minHeight={SPACER_MINIMUM_HEIGHT} />;
}

export default createBuiltin(Spacer, {
  helperText: 'Spacer component.\nIt allows for creating space between elements.',
  minimumLayoutHeight: SPACER_MINIMUM_HEIGHT,
  argTypes: {
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
