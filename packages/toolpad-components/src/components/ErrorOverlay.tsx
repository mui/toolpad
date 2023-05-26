import { Typography, styled } from '@mui/material';
import * as React from 'react';
import { errorFrom } from '@mui/toolpad-utils/errors';

const OverlayRoot = styled('div')(({ theme }) => ({
  position: 'absolute',
  inset: '0 0 0 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderStyle: 'solid',
  borderRadius: theme.shape.borderRadius,
  borderColor: theme.palette.divider,
}));

interface ErrorOverlayProps {
  error?: unknown;
}

export default function ErrorOverlay({ error }: ErrorOverlayProps) {
  const errMEssage = error ? errorFrom(error).message : null;
  return (
    <OverlayRoot sx={{ display: error ? undefined : 'none' }}>
      <Typography>Error</Typography>
      <Typography variant="body2">{errMEssage}</Typography>
    </OverlayRoot>
  );
}
