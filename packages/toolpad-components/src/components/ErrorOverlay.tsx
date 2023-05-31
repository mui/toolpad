import { Typography, styled } from '@mui/material';
import * as React from 'react';
import { errorFrom } from '@mui/toolpad-utils/errors';
import ErrorIcon from '@mui/icons-material/Error';

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
  const errMessage = error ? errorFrom(error).message : null;
  return errMessage ? (
    <OverlayRoot>
      <Typography sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
        <ErrorIcon fontSize="small" color="error" />
        Error
      </Typography>
      <Typography variant="body2">{errMessage}</Typography>
    </OverlayRoot>
  ) : null;
}
