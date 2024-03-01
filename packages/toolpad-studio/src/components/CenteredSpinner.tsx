import { CircularProgress, Box, SxProps } from '@mui/material';
import * as React from 'react';

export interface CenteredSpinnerProps {
  sx?: SxProps;
}

export default function CenteredSpinner({ sx }: CenteredSpinnerProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <CircularProgress />
    </Box>
  );
}
