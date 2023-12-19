import { SxProps, Typography, styled } from '@mui/material';
import * as React from 'react';
import { errorFrom } from '@mui/toolpad-utils/errors';
import ErrorIcon from '@mui/icons-material/Error';

const OverlayRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
}));

interface ErrorContentProps {
  sx?: SxProps;
  error: NonNullable<unknown>;
}

export function ErrorContent({ sx, error }: ErrorContentProps) {
  const errMessage = errorFrom(error).message;
  return (
    <OverlayRoot sx={sx}>
      <Typography sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
        <ErrorIcon fontSize="small" color="error" />
        Error
      </Typography>
      <Typography variant="body2">{errMessage}</Typography>
    </OverlayRoot>
  );
}

const ErrorOverlay: React.ComponentType<ErrorContentProps> = styled(ErrorContent)(({ theme }) => ({
  position: 'absolute',
  inset: '0 0 0 0',
  borderWidth: 1,
  borderStyle: 'solid',
  borderRadius: theme.shape.borderRadius,
  borderColor: theme.palette.divider,
}));

export default ErrorOverlay;
