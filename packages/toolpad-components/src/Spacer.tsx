import * as React from 'react';
import { Box, BoxProps } from '@mui/material';
import createBuiltin from './createBuiltin';
import { SX_PROP_HELPER_TEXT } from './constants';

interface SpacerProps extends BoxProps {
  height: number;
}

function Spacer(props: SpacerProps) {
  return <Box {...props} />;
}

export default createBuiltin(Spacer, {
  helperText: 'Space component.\nIt allows for creating space between elements.',
  resizableHeightProp: 'height',
  argTypes: {
    height: {
      helperText: 'The height of the spacer.',
      type: 'number',
      default: 160,
      minimum: 20,
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
