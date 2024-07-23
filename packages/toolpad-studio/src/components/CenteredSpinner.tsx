import { CircularProgress, SxProps, styled } from '@mui/material';
import * as React from 'react';

const Root = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export interface CenteredSpinnerProps {
  sx?: SxProps;
}

export default function CenteredSpinner({ sx }: CenteredSpinnerProps) {
  return (
    <Root sx={sx}>
      <CircularProgress />
    </Root>
  );
}
